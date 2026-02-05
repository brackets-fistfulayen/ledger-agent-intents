import { Factory } from 'inversify';
import { Config } from '../../config/model/config.js';
import { InternalAuthContext } from '../../ledgersync/model/InternalAuthContext.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { NetworkService } from '../../network/NetworkService.js';
import { CloudSyncData } from '../model/cloudSyncTypes.js';
import { CloudSyncService } from './CloudSyncService.js';
export declare class DefaultCloudSyncService implements CloudSyncService {
    private readonly networkService;
    private readonly config;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, networkService: NetworkService<RequestInit>, config: Config);
    fetchEncryptedAccounts(authContext: InternalAuthContext): Promise<CloudSyncData>;
}
//# sourceMappingURL=DefaultCloudSyncService.d.ts.map