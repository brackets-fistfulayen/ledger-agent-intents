import { Observable } from 'rxjs';
import { LedgerSyncAuthenticateResponse } from '../../../api/model/LedgerSyncAuthenticateResponse.js';
import { InternalAuthContext } from '../model/InternalAuthContext.js';
import { LedgerSyncService } from './LedgerSyncService.js';
export declare class StubLedgerSyncService implements LedgerSyncService {
    get authContext(): InternalAuthContext | undefined;
    authenticate(): Observable<LedgerSyncAuthenticateResponse>;
    decrypt(_encryptedData: Uint8Array): Promise<Uint8Array>;
}
//# sourceMappingURL=StubLedgerSyncService.d.ts.map