import { Either } from 'purify-ts';
import { Config } from '../../../config/model/config.js';
import { NetworkServiceOpts } from '../../../network/model/types.js';
import { NetworkService } from '../../../network/NetworkService.js';
import { AlpacaDataSource } from './AlpacaDataSource.js';
import { AlpacaBalance, AlpacaFeeEstimationResponse, AlpacaTransactionIntent } from './alpacaTypes.js';
export declare class DefaultAlpacaDataSource implements AlpacaDataSource {
    private readonly networkService;
    private readonly config;
    constructor(networkService: NetworkService<NetworkServiceOpts>, config: Config);
    getBalanceForAddressAndCurrencyId(address: string, currencyId: string): Promise<Either<Error, AlpacaBalance[]>>;
    estimateTransactionFee(network: string, intent: AlpacaTransactionIntent): Promise<Either<Error, AlpacaFeeEstimationResponse>>;
}
//# sourceMappingURL=DefaultAlpacaDataSource.d.ts.map