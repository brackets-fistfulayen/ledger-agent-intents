import { Factory } from 'inversify';
import { BackendService } from '../../backend/BackendService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { AlpacaDataSource } from '../datasource/alpaca/AlpacaDataSource.js';
import { TransactionInfo, GasFeeEstimation } from '../model/types.js';
import { GasFeeEstimationService } from './GasFeeEstimationService.js';
export declare class DefaultGasFeeEstimationService implements GasFeeEstimationService {
    private readonly loggerFactory;
    private readonly backendService;
    private readonly alpacaDataSource;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, backendService: BackendService, alpacaDataSource: AlpacaDataSource);
    getNonceForTx(tx: TransactionInfo): Promise<string>;
    getFeesForTransaction(tx: TransactionInfo): Promise<GasFeeEstimation>;
    private getFeesFromAlpaca;
    private getFeesFromRpc;
    getMaxPriorityFeePerGas(tx: TransactionInfo): Promise<number>;
    getBaseFeePerGas(tx: TransactionInfo): Promise<number>;
    estimateGas(tx: TransactionInfo): Promise<number>;
    getNonce(tx: TransactionInfo): Promise<string | undefined>;
}
//# sourceMappingURL=DefaultGasFeeEstimationService.d.ts.map