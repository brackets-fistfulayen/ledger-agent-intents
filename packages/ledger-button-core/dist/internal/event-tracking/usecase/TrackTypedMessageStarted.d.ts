import { TypedData } from '@ledgerhq/device-signer-kit-ethereum';
import { Factory } from 'inversify';
import { Config } from '../../config/model/config.js';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { EventTrackingService } from '../service/EventTrackingService.js';
export declare class TrackTypedMessageStarted {
    private readonly eventTrackingService;
    private readonly config;
    private readonly contextService;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, eventTrackingService: EventTrackingService, config: Config, contextService: ContextService);
    execute(typedData: TypedData): Promise<void>;
}
//# sourceMappingURL=TrackTypedMessageStarted.d.ts.map