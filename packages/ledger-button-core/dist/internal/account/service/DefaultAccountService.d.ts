import { Factory } from 'inversify';
import { DAppConfigService } from '../../dAppConfig/service/DAppConfigService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../storage/StorageService.js';
import { HydrateAccountWithBalanceUseCase } from '../use-case/HydrateAccountWithBalanceUseCase.js';
import { Account, AccountService, CloudSyncData } from './AccountService.js';
export declare class DefaultAccountService implements AccountService {
    private readonly loggerFactory;
    private readonly storageService;
    private readonly dAppConfigService;
    private readonly hydrateAccountWithBalanceUseCase;
    private readonly logger;
    accounts: Account[];
    selectedAccount: Account | null;
    constructor(loggerFactory: Factory<LoggerPublisher>, storageService: StorageService, dAppConfigService: DAppConfigService, hydrateAccountWithBalanceUseCase: HydrateAccountWithBalanceUseCase);
    setAccountsFromCloudSyncData(cloudsyncData: CloudSyncData): Promise<void>;
    selectAccount(account: Account): void;
    getSelectedAccount(): Account | null;
    getAccounts(): Account[];
    setAccounts(accounts: Account[]): void;
    private mapCloudSyncDataToAccounts;
    getBalanceAndTokensForAccount(account: Account, withTokens: boolean): Promise<Account>;
}
//# sourceMappingURL=DefaultAccountService.d.ts.map