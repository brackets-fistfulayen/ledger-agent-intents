import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
export declare class DecryptKeyPairUseCase {
    private readonly loggerFactory;
    private logger;
    constructor(loggerFactory: LoggerPublisherFactory);
    execute(encryptedKeyPair: Uint8Array, decryptionKey: CryptoKey): Promise<Uint8Array>;
}
//# sourceMappingURL=DecryptKeyPairUseCase.d.ts.map