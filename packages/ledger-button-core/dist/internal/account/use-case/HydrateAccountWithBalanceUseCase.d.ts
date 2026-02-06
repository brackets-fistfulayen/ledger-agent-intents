import { BackendService } from '../../backend/BackendService.js';
import { BalanceService } from '../../balance/service/BalanceService.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { Account } from '../service/AccountService.js';
export declare class HydrateAccountWithBalanceUseCase {
    private readonly balanceService;
    private readonly backendService;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, balanceService: BalanceService, backendService: BackendService);
    execute(account: Account, withTokens?: boolean): Promise<Account>;
    private formatSuccessfulBalanceResult;
    private handleBalanceServiceFailure;
    private fetchBalanceFromRpc;
    private formatBalance;
    private mapTokenBalances;
}
//# sourceMappingURL=HydrateAccountWithBalanceUseCase.d.ts.map