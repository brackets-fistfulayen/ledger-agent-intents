import { Factory } from 'inversify';
import { CounterValueDataSource } from '../../balance/datasource/countervalue/CounterValueDataSource.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { Account, AccountWithFiat } from '../service/AccountService.js';
export declare class HydrateAccountWithFiatUseCase {
    private readonly counterValueDataSource;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, counterValueDataSource: CounterValueDataSource);
    execute(account: Account, targetCurrency?: string): Promise<AccountWithFiat>;
    private logHydrationStart;
    private skipHydration;
    private fetchCounterValues;
    private buildLedgerIds;
    private logHydrationSuccess;
    private calculateAccountFiat;
    private hydrateTokensWithFiat;
}
//# sourceMappingURL=hydrateAccountWithFiatUseCase.d.ts.map