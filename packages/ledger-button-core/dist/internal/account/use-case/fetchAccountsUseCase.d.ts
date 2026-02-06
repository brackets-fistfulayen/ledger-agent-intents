import { AccountService, Account } from '../service/AccountService.js';
import { FetchCloudSyncAccountsUseCase } from './fetchCloudSyncAccountsUseCase.js';
export declare class FetchAccountsUseCase {
    private readonly fetchCloudSyncAccountsUseCase;
    private readonly accountService;
    constructor(fetchCloudSyncAccountsUseCase: FetchCloudSyncAccountsUseCase, accountService: AccountService);
    execute(): Promise<Account[]>;
}
//# sourceMappingURL=fetchAccountsUseCase.d.ts.map