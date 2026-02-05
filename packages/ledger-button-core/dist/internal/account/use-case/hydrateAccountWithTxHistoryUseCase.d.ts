import { Factory } from 'inversify';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { TransactionHistoryItem } from '../../transaction-history/model/transactionHistoryTypes.js';
import { FetchTransactionHistoryUseCase } from '../../transaction-history/use-case/FetchTransactionHistoryUseCase.js';
import { Account } from '../service/AccountService.js';
export type AccountWithTransactionHistory = Account & {
    transactionHistory: TransactionHistoryItem[] | undefined;
};
export declare class HydrateAccountWithTxHistoryUseCase {
    private readonly fetchTransactionHistoryUseCase;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, fetchTransactionHistoryUseCase: FetchTransactionHistoryUseCase);
    execute(account: Account): Promise<AccountWithTransactionHistory>;
}
//# sourceMappingURL=hydrateAccountWithTxHistoryUseCase.d.ts.map