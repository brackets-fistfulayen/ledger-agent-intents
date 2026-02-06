import { Either, Maybe } from 'purify-ts';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { StorageIDBErrors } from '../model/errors.js';
import { UserConsent } from '../model/UserConsent.js';
import { IndexedDbService } from './IndexedDbService.js';
export declare class DefaultIndexedDbService implements IndexedDbService {
    private readonly loggerFactory;
    private readonly logger;
    private initialization;
    private idb;
    constructor(loggerFactory: LoggerPublisherFactory);
    initIdb(): Promise<Either<StorageIDBErrors, IDBDatabase>>;
    storeKeyPair(keyPair: Uint8Array): Promise<Either<StorageIDBErrors, boolean>>;
    getKeyPair(): Promise<Either<StorageIDBErrors, Uint8Array>>;
    removeKeyPair(): Promise<Either<StorageIDBErrors, boolean>>;
    storeEncryptionKey(encryptionKey: CryptoKey): Promise<void>;
    getEncryptionKey(): Promise<Maybe<CryptoKey>>;
    setDbVersion(version: number): Promise<Either<StorageIDBErrors, void>>;
    getDbVersion(): Promise<Either<StorageIDBErrors, Maybe<number>>>;
    storeUserConsent(consent: UserConsent): Promise<Either<StorageIDBErrors, void>>;
    getUserConsent(): Promise<Either<StorageIDBErrors, Maybe<UserConsent>>>;
    storeWelcomeScreenCompleted(completed: boolean): Promise<Either<StorageIDBErrors, void>>;
    getWelcomeScreenCompleted(): Promise<Either<StorageIDBErrors, Maybe<boolean>>>;
}
//# sourceMappingURL=DefaultIndexedDbService.d.ts.map