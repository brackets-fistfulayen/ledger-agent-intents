import { Either } from 'purify-ts';
import { EventRequest, EventResponse } from './model/trackEvent.js';
import { Config } from '../config/model/config.js';
import { NetworkServiceOpts } from '../network/model/types.js';
import { NetworkService } from '../network/NetworkService.js';
import { BackendService } from './BackendService.js';
import { BroadcastRequest, BroadcastResponse, ConfigRequest } from './types.js';
export declare class DefaultBackendService implements BackendService {
    private readonly networkService;
    private readonly config;
    constructor(networkService: NetworkService<NetworkServiceOpts>, config: Config);
    broadcast(request: BroadcastRequest, domain?: string): Promise<Either<Error, BroadcastResponse>>;
    getConfig(request: ConfigRequest): Promise<Either<Error | import('zod').ZodError<{
        supportedBlockchains: {
            id: string;
            currency_id: string;
            currency_name: string;
            currency_ticker: string;
        }[];
        referralUrl: string;
        domainUrl: string;
        appDependencies: {
            blockchain: string;
            appName: string;
            dependencies: string[];
        }[];
    }>, {
        supportedBlockchains: {
            id: string;
            currency_id: string;
            currency_name: string;
            currency_ticker: string;
        }[];
        referralUrl: string;
        domainUrl: string;
        appDependencies: {
            blockchain: string;
            appName: string;
            dependencies: string[];
        }[];
    }>>;
    event(request: EventRequest, domain?: string): Promise<Either<Error, EventResponse>>;
}
//# sourceMappingURL=DefaultBackendService.d.ts.map