import { Factory } from 'inversify';
import { CloudSyncService } from '../../cloudsync/service/CloudSyncService.js';
import { LedgerSyncService } from '../../ledgersync/service/LedgerSyncService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { CloudSyncData } from '../service/AccountService.js';
export declare class FetchCloudSyncAccountsUseCase {
    private readonly ledgerSyncService;
    private readonly cloudSyncService;
    private logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, ledgerSyncService: LedgerSyncService, cloudSyncService: CloudSyncService);
    execute(): Promise<CloudSyncData>;
    private getAuthContextOrThrow;
    private authenticateWithKeyPair;
    private fetchAndDecryptAccounts;
}
//# sourceMappingURL=fetchCloudSyncAccountsUseCase.d.ts.map