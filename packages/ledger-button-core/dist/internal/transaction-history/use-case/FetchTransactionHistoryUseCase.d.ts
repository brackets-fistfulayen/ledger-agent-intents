import { Either } from 'purify-ts';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { TransactionHistoryDataSource } from '../datasource/TransactionHistoryDataSource.js';
import { TransactionHistoryError } from '../model/TransactionHistoryError.js';
import { TransactionHistoryOptions, TransactionHistoryResult } from '../model/transactionHistoryTypes.js';
export declare class FetchTransactionHistoryUseCase {
    private readonly dataSource;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, dataSource: TransactionHistoryDataSource);
    execute(blockchain: string, address: string, options?: TransactionHistoryOptions): Promise<Either<TransactionHistoryError, TransactionHistoryResult>>;
    private transformResponse;
    private transformTransaction;
    private determineTransactionType;
    private calculateTransactionValue;
    private getTokenTransferValue;
    private getNativeValue;
    private extractTimestamp;
}
//# sourceMappingURL=FetchTransactionHistoryUseCase.d.ts.map