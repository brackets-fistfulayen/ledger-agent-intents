import { Either } from 'purify-ts';
import { TransactionHistoryError } from '../model/TransactionHistoryError.js';
import { ExplorerResponse, TransactionHistoryOptions } from '../model/transactionHistoryTypes.js';
export interface TransactionHistoryDataSource {
    getTransactions(blockchain: string, address: string, options?: TransactionHistoryOptions): Promise<Either<TransactionHistoryError, ExplorerResponse>>;
}
//# sourceMappingURL=TransactionHistoryDataSource.d.ts.map