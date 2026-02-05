import { Observable } from 'rxjs';
import { LedgerSyncAuthenticateResponse } from '../../../api/model/LedgerSyncAuthenticateResponse.js';
import { InternalAuthContext } from '../model/InternalAuthContext.js';
export interface LedgerSyncService {
    authContext: InternalAuthContext | undefined;
    authenticate(): Observable<LedgerSyncAuthenticateResponse>;
    decrypt(encryptedData: Uint8Array): Promise<Uint8Array>;
}
//# sourceMappingURL=LedgerSyncService.d.ts.map