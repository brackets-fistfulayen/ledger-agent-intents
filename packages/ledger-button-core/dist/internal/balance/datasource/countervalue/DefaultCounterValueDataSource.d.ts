import { Either } from 'purify-ts';
import { Config } from '../../../config/model/config.js';
import { NetworkServiceOpts } from '../../../network/model/types.js';
import { NetworkService } from '../../../network/NetworkService.js';
import { CounterValueDataSource } from './CounterValueDataSource.js';
import { CounterValueResult } from './counterValueTypes.js';
export declare class DefaultCounterValueDataSource implements CounterValueDataSource {
    private readonly networkService;
    private readonly config;
    constructor(networkService: NetworkService<NetworkServiceOpts>, config: Config);
    getCounterValues(ledgerIds: string[], targetCurrency: string): Promise<Either<Error, CounterValueResult[]>>;
}
//# sourceMappingURL=DefaultCounterValueDataSource.d.ts.map