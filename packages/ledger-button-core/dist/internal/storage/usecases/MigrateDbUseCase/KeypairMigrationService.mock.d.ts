import { KeyPair } from '@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol';
import { Factory } from 'inversify';
import { LoggerPublisher } from '../../../logger/service/LoggerPublisher.js';
import { KeyPairMigrationService } from './KeypairMigrationService.js';
export declare const mockKeyPairBuffer: Uint8Array<ArrayBuffer>;
export declare const mockEncryptedKeyPair: Uint8Array<ArrayBuffer>;
export declare const createMockKeyPair: () => KeyPair;
export declare const createMockLogger: () => {
    info: any;
    error: any;
};
export declare const createMockLoggerFactory: (mockLogger: ReturnType<typeof createMockLogger>) => Factory<LoggerPublisher>;
export declare const createMockStorageService: () => {
    removeKeyPair: any;
    storeKeyPair: any;
};
export declare const createMockEncryptKeyPairUseCase: () => {
    execute: any;
};
export declare const createMockGetEncryptionKeyUseCase: () => {
    execute: any;
};
export declare const createMockGetKeyPairUseCase: () => {
    execute: any;
};
export declare const createKeyPairMigrationService: (mockLoggerFactory: ReturnType<typeof createMockLoggerFactory>, mockStorageService: ReturnType<typeof createMockStorageService>, mockEncryptKeyPairUseCase: ReturnType<typeof createMockEncryptKeyPairUseCase>, mockGetEncryptionKeyUseCase: ReturnType<typeof createMockGetEncryptionKeyUseCase>, mockGetKeyPairUseCase: ReturnType<typeof createMockGetKeyPairUseCase>) => KeyPairMigrationService;
//# sourceMappingURL=KeypairMigrationService.mock.d.ts.map