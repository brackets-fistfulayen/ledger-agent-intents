import { Config } from '../../config/model/config.js';
import { InternalAuthContext } from '../../ledgersync/model/InternalAuthContext.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { NetworkService } from '../../network/NetworkService.js';
import { CloudSyncData } from '../model/cloudSyncTypes.js';
import { CloudSyncService } from './CloudSyncService.js';
export declare class DefaultCloudSyncService implements CloudSyncService {
    private readonly networkService;
    private readonly config;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, networkService: NetworkService<RequestInit>, config: Config);
    fetchEncryptedAccounts(authContext: InternalAuthContext): Promise<CloudSyncData>;
}
//# sourceMappingURL=DefaultCloudSyncService.d.ts.map