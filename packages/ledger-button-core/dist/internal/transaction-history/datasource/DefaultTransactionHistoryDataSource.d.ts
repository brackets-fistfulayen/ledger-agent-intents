import { Either } from 'purify-ts';
import { Config } from '../../config/model/config.js';
import { NetworkServiceOpts } from '../../network/model/types.js';
import { NetworkService } from '../../network/NetworkService.js';
import { TransactionHistoryError } from '../model/TransactionHistoryError.js';
import { ExplorerResponse, TransactionHistoryOptions } from '../model/transactionHistoryTypes.js';
import { TransactionHistoryDataSource } from './TransactionHistoryDataSource.js';
export declare class DefaultTransactionHistoryDataSource implements TransactionHistoryDataSource {
    private readonly networkService;
    private readonly config;
    constructor(networkService: NetworkService<NetworkServiceOpts>, config: Config);
    getTransactions(blockchain: string, address: string, options?: TransactionHistoryOptions): Promise<Either<TransactionHistoryError, ExplorerResponse>>;
    private buildQueryParams;
    private buildRequestUrl;
}
//# sourceMappingURL=DefaultTransactionHistoryDataSource.d.ts.map