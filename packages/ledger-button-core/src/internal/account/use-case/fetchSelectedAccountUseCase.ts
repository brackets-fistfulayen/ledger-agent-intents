import type { Factory } from "inversify";
import { inject, injectable } from "inversify";
import { Either, Left, Right } from "purify-ts";
import { lastValueFrom } from "rxjs";

import {
  AccountNotFoundError,
  NoSelectedAccountError,
} from "../../../api/errors/LedgerSyncErrors.js";
import { contextModuleTypes } from "../../context/contextModuleTypes.js";
import type { ContextService } from "../../context/ContextService.js";
import { ledgerSyncModuleTypes } from "../../ledgersync/ledgerSyncModuleTypes.js";
import type { LedgerSyncService } from "../../ledgersync/service/LedgerSyncService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { accountModuleTypes } from "../accountModuleTypes.js";
import type {
  Account,
  AccountWithFiat,
  DetailedAccount,
} from "../service/AccountService.js";
import type { FetchAccountsUseCase } from "./fetchAccountsUseCase.js";
import type { HydrateAccountWithBalanceUseCase } from "./HydrateAccountWithBalanceUseCase.js";
import type { HydrateAccountWithFiatUseCase } from "./hydrateAccountWithFiatUseCase.js";
import type {
  AccountWithTransactionHistory,
  HydrateAccountWithTxHistoryUseCase,
} from "./hydrateAccountWithTxHistoryUseCase.js";

export type AccountError = NoSelectedAccountError | AccountNotFoundError;

@injectable()
export class FetchSelectedAccountUseCase {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(contextModuleTypes.ContextService)
    private readonly contextService: ContextService,
    @inject(ledgerSyncModuleTypes.LedgerSyncService)
    private readonly ledgerSyncService: LedgerSyncService,
    @inject(accountModuleTypes.FetchAccountsUseCase)
    private readonly fetchAccountsUseCase: FetchAccountsUseCase,
    @inject(accountModuleTypes.HydrateAccountWithBalanceUseCase)
    private readonly hydrateWithBalanceUseCase: HydrateAccountWithBalanceUseCase,
    @inject(accountModuleTypes.HydrateAccountWithFiatUseCase)
    private readonly hydrateWithFiatUseCase: HydrateAccountWithFiatUseCase,
    @inject(accountModuleTypes.HydrateAccountWithTxHistoryUseCase)
    private readonly hydrateWithTxHistoryUseCase: HydrateAccountWithTxHistoryUseCase,
  ) {
    this.logger = loggerFactory("FetchSelectedAccountUseCase");
  }

  async execute(): Promise<Either<AccountError, DetailedAccount>> {
    const accountResult = await this.getSelectedAccountFromContext();

    if (accountResult.isLeft()) {
      return accountResult;
    }

    const account = accountResult.unsafeCoerce();
    const detailedAccount = await this.hydrateDetailedAccount(account);

    this.emitAccountChangedEvent(detailedAccount);

    this.logger.info("Selected account fetched with details", {
      address: detailedAccount.freshAddress,
      hasBalance: !!detailedAccount.balance,
      hasFiat: !!detailedAccount.fiatBalance,
      txCount: detailedAccount.transactionHistory?.length ?? 0,
    });

    return Right(detailedAccount);
  }

  private async getSelectedAccountFromContext(): Promise<
    Either<AccountError, Account>
  > {
    const context = this.contextService.getContext();

    if (!context.selectedAccount) {
      return Left(new NoSelectedAccountError());
    }

    await lastValueFrom(this.ledgerSyncService.authenticate());

    const accounts = await this.fetchAccountsUseCase.execute();
    // Match by both freshAddress AND currencyId to handle EVM chains
    // where the same address is used across different networks
    const account = accounts.find(
      (a) =>
        a.freshAddress === context.selectedAccount?.freshAddress &&
        a.currencyId === context.selectedAccount?.currencyId,
    );

    if (!account) {
      this.logger.error("Selected account not found in Ledger Sync accounts", {
        address: context.selectedAccount?.freshAddress,
        currencyId: context.selectedAccount?.currencyId,
      });

      return Left(
        new AccountNotFoundError(
          "Selected account not found in Ledger Sync accounts",
          {
            address: context.selectedAccount.freshAddress,
            currencyId: context.selectedAccount.currencyId,
          },
        ),
      );
    }

    return Right(account);
  }

  private async hydrateDetailedAccount(
    account: Account,
  ): Promise<DetailedAccount> {
    const withBalance = await this.hydrateWithBalanceUseCase.execute(account);

    const [withFiat, withTxHistory] = await Promise.all([
      this.hydrateWithFiatUseCase.execute(withBalance),
      this.hydrateWithTxHistoryUseCase.execute(withBalance),
    ]);

    return this.mergeHydrations(withBalance, withFiat, withTxHistory);
  }

  private mergeHydrations(
    withBalance: Account,
    withFiat: AccountWithFiat,
    withTxHistory: AccountWithTransactionHistory,
  ): DetailedAccount {
    return {
      ...withBalance,
      fiatBalance: withFiat.fiatBalance,
      tokens: withFiat.tokens,
      transactionHistory: withTxHistory.transactionHistory,
    };
  }

  private emitAccountChangedEvent(account: DetailedAccount): void {
    this.contextService.onEvent({
      type: "account_changed",
      account,
    });
  }
}
