import { KeyPair } from '@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol';
import { Factory } from 'inversify';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../storage/StorageService.js';
import { DecryptKeyPairUseCase } from './DecryptKeyPairUseCase.js';
import { EncryptKeyPairUseCase } from './EncryptKeyPairUseCase.js';
import { GenerateKeyPairUseCase } from './GenerateKeyPairUseCase.js';
import { GetEncryptionKeyUseCase } from './GetEncryptionKey.js';
export declare class GetOrCreateKeyPairUseCase {
    private readonly storageService;
    private readonly generateKeyPairUseCase;
    private readonly getEncryptionKeyUseCase;
    private readonly encryptKeyPairUseCase;
    private readonly decryptKeyPairUseCase;
    private logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, storageService: StorageService, generateKeyPairUseCase: GenerateKeyPairUseCase, getEncryptionKeyUseCase: GetEncryptionKeyUseCase, encryptKeyPairUseCase: EncryptKeyPairUseCase, decryptKeyPairUseCase: DecryptKeyPairUseCase);
    execute(): Promise<KeyPair>;
}
//# sourceMappingURL=GetOrCreateKeyPairUseCase.d.ts.map