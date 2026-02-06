import { KeyPair } from '@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
export declare class GenerateKeyPairUseCase {
    private logger;
    constructor(loggerFactory: LoggerPublisherFactory);
    execute(): Promise<KeyPair>;
}
//# sourceMappingURL=GenerateKeyPairUseCase.d.ts.map