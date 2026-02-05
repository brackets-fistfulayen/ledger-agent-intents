import { type Factory, inject, injectable } from "inversify";

import { NoCompatibleAccountsError } from "../../../api/errors/LedgerSyncErrors.js";
import { dAppConfigModuleTypes } from "../../dAppConfig/di/dAppConfigModuleTypes.js";
import { type DAppConfigService } from "../../dAppConfig/service/DAppConfigService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { type LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { storageModuleTypes } from "../../storage/storageModuleTypes.js";
import { type StorageService } from "../../storage/StorageService.js";
import { accountModuleTypes } from "../accountModuleTypes.js";
import type { HydrateAccountWithBalanceUseCase } from "../use-case/HydrateAccountWithBalanceUseCase.js";
import {
  type Account,
  type AccountService,
  type CloudSyncData,
} from "./AccountService.js";

@injectable()
export class DefaultAccountService implements AccountService {
  private readonly logger: LoggerPublisher;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    private readonly loggerFactory: Factory<LoggerPublisher>,
    @inject(storageModuleTypes.StorageService)
    private readonly storageService: StorageService,
    @inject(dAppConfigModuleTypes.DAppConfigService)
    private readonly dAppConfigService: DAppConfigService,
    @inject(accountModuleTypes.HydrateAccountWithBalanceUseCase)
    private readonly hydrateAccountWithBalanceUseCase: HydrateAccountWithBalanceUseCase,
  ) {
    this.logger = this.loggerFactory("[Account Service]");
  }

  async setAccountsFromCloudSyncData(
    cloudsyncData: CloudSyncData,
  ): Promise<void> {
    const mappedAccounts = await this.mapCloudSyncDataToAccounts(cloudsyncData);

    this.setAccounts(mappedAccounts);
  }

  selectAccount(account: Account): void {
    const found = this.accounts.find((acc) => acc.id === account.id);

    if (found) {
      this.selectedAccount = found;
      this.logger.info("Account selected, saving to storage", {
        account: found,
      });
      this.storageService.saveSelectedAccount(found);
    }
  }

  getSelectedAccount(): Account | null {
    return this.selectedAccount;
  }

  getAccounts(): Account[] {
    return this.accounts;
  }

  setAccounts(accounts: Account[]) {
    this.accounts = accounts;
    this.logger.debug("saving accounts", { accounts: this.accounts });

    // Also update selectedAccount if it exists in the new accounts list
    // This ensures the selected account gets updated with new balance/tokens
    if (this.selectedAccount) {
      const updatedSelectedAccount = accounts.find(
        (acc) => acc.id === this.selectedAccount?.id,
      );
      if (updatedSelectedAccount) {
        this.selectedAccount = updatedSelectedAccount;
        // Update storage with the new data
        this.storageService.saveSelectedAccount(updatedSelectedAccount);
      }
    }
  }

  private async mapCloudSyncDataToAccounts(
    cloudSyncData: CloudSyncData,
  ): Promise<Account[]> {
    const { accounts, accountNames } = cloudSyncData;
    const supportedBlockchains = (await this.dAppConfigService.getDAppConfig())
      .supportedBlockchains;

    const accs = accounts
      .map((account) => {
        const blockchain = supportedBlockchains.find(
          (blockchain) => blockchain.currency_id === account.currencyId,
        );

        const name =
          accountNames[account.id] ??
          `${blockchain?.currency_name} Account ${account.index}`;

        const ticker = blockchain?.currency_ticker;
        return ticker
          ? ({
              ...account,
              name,
              ticker,
              derivationMode: account.derivationMode
                ? account.derivationMode
                : "",
              balance: undefined,
              tokens: [],
            } as Account)
          : undefined;
      })
      .filter((account) => account !== undefined);

    if (accs.length === 0) {
      throw new NoCompatibleAccountsError("No accounts found", {
        networks: supportedBlockchains.map((network) => network.currency_name),
      });
    }

    return accs;
  }

  async getBalanceAndTokensForAccount(
    account: Account,
    withTokens: boolean,
  ): Promise<Account> {
    return this.hydrateAccountWithBalanceUseCase.execute(account, withTokens);
  }
}
