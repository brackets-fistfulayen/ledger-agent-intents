import { EncryptKeyPairUseCase } from '../../../cryptographic/usecases/EncryptKeyPairUseCase.js';
import { GetEncryptionKeyUseCase } from '../../../cryptographic/usecases/GetEncryptionKey.js';
import { GetOrCreateKeyPairUseCase } from '../../../cryptographic/usecases/GetOrCreateKeyPairUseCase.js';
import { LoggerPublisherFactory } from '../../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../StorageService.js';
export declare class KeyPairMigrationService {
    private readonly loggerFactory;
    private readonly storageService;
    private readonly encryptKeyPairUseCase;
    private readonly getEncryptionKeyUseCase;
    private readonly getOrCreateKeyPairUseCase;
    private logger;
    constructor(loggerFactory: LoggerPublisherFactory, storageService: StorageService, encryptKeyPairUseCase: EncryptKeyPairUseCase, getEncryptionKeyUseCase: GetEncryptionKeyUseCase, getOrCreateKeyPairUseCase: GetOrCreateKeyPairUseCase);
    migrateKeyPairToEncrypted(keyPairResult: Awaited<ReturnType<StorageService["getKeyPair"]>>): Promise<void>;
    private encryptExistingKeyPair;
}
//# sourceMappingURL=KeypairMigrationService.d.ts.map