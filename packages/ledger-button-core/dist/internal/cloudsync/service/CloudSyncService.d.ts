import { InternalAuthContext } from '../../../internal/ledgersync/model/InternalAuthContext.js';
import { CloudSyncData } from '../model/cloudSyncTypes.js';
export interface CloudSyncService {
    fetchEncryptedAccounts(authContext: InternalAuthContext): Promise<CloudSyncData>;
}
//# sourceMappingURL=CloudSyncService.d.ts.map