import { KeyPair } from '@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
export declare class EncryptKeyPairUseCase {
    private readonly loggerFactory;
    private logger;
    constructor(loggerFactory: LoggerPublisherFactory);
    execute(keyPair: KeyPair, encryptionKey: CryptoKey): Promise<Uint8Array>;
}
//# sourceMappingURL=EncryptKeyPairUseCase.d.ts.map