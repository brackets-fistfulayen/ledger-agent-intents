import { LedgerKeyringProtocol } from '@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol';
import { Factory } from 'inversify';
import { Observable } from 'rxjs';
import { LedgerSyncAuthenticateResponse } from '../../../api/model/LedgerSyncAuthenticateResponse.js';
import { Config } from '../../config/model/config.js';
import { GetOrCreateKeyPairUseCase } from '../../cryptographic/usecases/GetOrCreateKeyPairUseCase.js';
import { DeviceManagementKitService } from '../../device/service/DeviceManagementKitService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../storage/StorageService.js';
import { InternalAuthContext } from '../model/InternalAuthContext.js';
import { LedgerSyncService } from './LedgerSyncService.js';
export declare class DefaultLedgerSyncService implements LedgerSyncService {
    private readonly loggerFactory;
    private readonly deviceManagementKitService;
    private readonly storageService;
    private readonly getOrCreateKeyPairUseCase;
    private readonly config;
    private readonly logger;
    private _authContext;
    lkrpAppKit: LedgerKeyringProtocol;
    private keyPair;
    private trustChainId;
    constructor(loggerFactory: Factory<LoggerPublisher>, deviceManagementKitService: DeviceManagementKitService, storageService: StorageService, getOrCreateKeyPairUseCase: GetOrCreateKeyPairUseCase, config: Config);
    authenticate(): Observable<LedgerSyncAuthenticateResponse>;
    decrypt(encryptedData: Uint8Array): Promise<Uint8Array>;
    get authContext(): InternalAuthContext;
    private getClientName;
    private prepareAuthenticationData;
    private createAuthenticateInput;
    private createDeviceAuthenticateInput;
    private createKeypairAuthenticateInput;
    private executeAuthentication;
    private mapAuthenticateResponse;
}
//# sourceMappingURL=DefaultLedgerSyncService.d.ts.map