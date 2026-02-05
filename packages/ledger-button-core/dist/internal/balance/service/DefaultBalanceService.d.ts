import { Factory } from 'inversify';
import { Either } from 'purify-ts';
import { Account } from '../../../internal/account/service/AccountService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { AlpacaDataSource } from '../datasource/alpaca/AlpacaDataSource.js';
import { CalDataSource } from '../datasource/cal/CalDataSource.js';
import { AccountBalance } from '../model/types.js';
import { BalanceService } from './BalanceService.js';
export declare class DefaultBalanceService implements BalanceService {
    private readonly loggerFactory;
    private readonly alpacaDataSource;
    private readonly calDataSource;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, alpacaDataSource: AlpacaDataSource, calDataSource: CalDataSource);
    getBalanceForAccount(account: Account, withTokens: boolean): Promise<Either<Error, AccountBalance>>;
}
//# sourceMappingURL=DefaultBalanceService.d.ts.map