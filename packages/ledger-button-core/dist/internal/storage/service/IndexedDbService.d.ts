import { Either, Maybe } from 'purify-ts';
import { StorageIDBErrors } from '../model/errors.js';
import { UserConsent } from '../model/UserConsent.js';
export interface IndexedDbService {
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
//# sourceMappingURL=IndexedDbService.d.ts.map