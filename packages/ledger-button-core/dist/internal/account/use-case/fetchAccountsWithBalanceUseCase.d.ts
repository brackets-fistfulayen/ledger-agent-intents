import { Observable } from 'rxjs';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { Account } from '../service/AccountService.js';
import { FetchAccountsUseCase } from './fetchAccountsUseCase.js';
import { HydrateAccountWithBalanceUseCase } from './HydrateAccountWithBalanceUseCase.js';
export declare class FetchAccountsWithBalanceUseCase {
    private readonly fetchAccountsUseCase;
    private readonly hydrateAccountWithBalanceUseCase;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, fetchAccountsUseCase: FetchAccountsUseCase, hydrateAccountWithBalanceUseCase: HydrateAccountWithBalanceUseCase);
    execute(): Observable<Account[]>;
    private initializeAccountsWithEmptyBalances;
    private createBalanceObservable;
    private mergeAccountUpdate;
}
//# sourceMappingURL=fetchAccountsWithBalanceUseCase.d.ts.map