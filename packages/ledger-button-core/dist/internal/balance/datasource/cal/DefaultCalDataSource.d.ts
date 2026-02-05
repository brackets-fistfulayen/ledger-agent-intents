import { Either } from 'purify-ts';
import { Config } from '../../../config/model/config.js';
import { NetworkServiceOpts } from '../../../network/model/types.js';
import { NetworkService } from '../../../network/NetworkService.js';
import { CalDataSource } from './CalDataSource.js';
import { TokenInformation } from './calTypes.js';
export declare class DefaultCalDataSource implements CalDataSource {
    private readonly networkService;
    private readonly config;
    constructor(networkService: NetworkService<NetworkServiceOpts>, config: Config);
    getTokenInformation(tokenAddress: string, currencyId: string): Promise<Either<Error, TokenInformation>>;
}
//# sourceMappingURL=DefaultCalDataSource.d.ts.map