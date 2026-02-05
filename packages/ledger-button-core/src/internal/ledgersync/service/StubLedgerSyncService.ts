import { injectable } from "inversify";
import { Observable, of } from "rxjs";

import { LedgerSyncAuthenticateResponse } from "../../../api/model/LedgerSyncAuthenticateResponse.js";
import { InternalAuthContext } from "../model/InternalAuthContext.js";
import { LedgerSyncService } from "./LedgerSyncService.js";

@injectable()
export class StubLedgerSyncService implements LedgerSyncService {
  get authContext(): InternalAuthContext | undefined {
    return undefined;
  }

  authenticate(): Observable<LedgerSyncAuthenticateResponse> {
    return of({
      jwt: "jwt",
      trustChainId: "trustchainId",
      applicationPath: "applicationPath",
      encryptionKey: new Uint8Array(),
      keyPair: new Uint8Array(),
    } as unknown as InternalAuthContext);
  }

  decrypt(_encryptedData: Uint8Array): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array());
  }
}
