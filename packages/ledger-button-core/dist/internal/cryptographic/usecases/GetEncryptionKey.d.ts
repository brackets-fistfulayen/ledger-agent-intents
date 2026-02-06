import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../storage/StorageService.js';
export declare class GetEncryptionKeyUseCase {
    private readonly loggerFactory;
    private readonly storageService;
    private logger;
    constructor(loggerFactory: LoggerPublisherFactory, storageService: StorageService);
    execute(): Promise<CryptoKey>;
    storeEncryptionKey(encryptionKey: CryptoKey): Promise<void>;
    generateAndStoreEncryptionKey(): Promise<CryptoKey>;
}
//# sourceMappingURL=GetEncryptionKey.d.ts.map