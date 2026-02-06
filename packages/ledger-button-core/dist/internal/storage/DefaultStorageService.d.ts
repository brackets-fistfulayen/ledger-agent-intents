import { Either, Maybe } from 'purify-ts';
import { StorageIDBErrors } from './model/errors.js';
import { UserConsent } from './model/UserConsent.js';
import { IndexedDbService } from './service/IndexedDbService.js';
import { Account } from '../account/service/AccountService.js';
import { LoggerPublisherFactory } from '../logger/service/LoggerPublisher.js';
import { StorageService } from './StorageService.js';
export declare class DefaultStorageService implements StorageService {
    private readonly loggerFactory;
    private readonly indexedDbService;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, indexedDbService: IndexedDbService);
    static formatKey(key: string): string;
    setDbVersion(version: number): Promise<Either<StorageIDBErrors, void>>;
    getDbVersion(): Promise<number>;
    storeKeyPair(keyPair: Uint8Array): Promise<Either<StorageIDBErrors, boolean>>;
    getKeyPair(): Promise<Either<StorageIDBErrors, Uint8Array>>;
    removeKeyPair(): Promise<Either<StorageIDBErrors, boolean>>;
    storeEncryptionKey(encryptionKey: CryptoKey): Promise<void>;
    getEncryptionKey(): Promise<Maybe<CryptoKey>>;
    saveTrustChainId(_trustChainId: string): void;
    getTrustChainId(): Maybe<string>;
    removeTrustChainId(): void;
    isTrustChainValid(): boolean;
    saveSelectedAccount(selectedAccount: Account): void;
    getSelectedAccount(): Maybe<Account>;
    removeSelectedAccount(): void;
    /***  Local Storage Primitives ***/
    saveItem<T>(key: string, value: T): void;
    removeItem(key: string): boolean;
    hasItem(key: string): boolean;
    resetStorage(): void;
    getItem<T>(key: string): Maybe<T>;
    saveUserConsent(consent: UserConsent): Promise<void>;
    getUserConsent(): Promise<Maybe<UserConsent>>;
    removeUserConsent(): Promise<void>;
    saveWelcomeScreenCompleted(): Promise<void>;
    isWelcomeScreenCompleted(): Promise<boolean>;
    removeWelcomeScreenCompleted(): Promise<void>;
}
//# sourceMappingURL=DefaultStorageService.d.ts.map