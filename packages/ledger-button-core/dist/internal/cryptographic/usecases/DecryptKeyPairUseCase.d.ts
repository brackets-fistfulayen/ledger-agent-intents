import { Factory } from 'inversify';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
export declare class DecryptKeyPairUseCase {
    private readonly loggerFactory;
    private logger;
    constructor(loggerFactory: Factory<LoggerPublisher>);
    execute(encryptedKeyPair: Uint8Array, decryptionKey: CryptoKey): Promise<Uint8Array>;
}
//# sourceMappingURL=DecryptKeyPairUseCase.d.ts.map