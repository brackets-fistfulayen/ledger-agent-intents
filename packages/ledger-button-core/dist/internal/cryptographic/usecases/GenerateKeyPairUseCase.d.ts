import { KeyPair } from '@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol';
import { Factory } from 'inversify';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
export declare class GenerateKeyPairUseCase {
    private logger;
    constructor(loggerFactory: Factory<LoggerPublisher>);
    execute(): Promise<KeyPair>;
}
//# sourceMappingURL=GenerateKeyPairUseCase.d.ts.map