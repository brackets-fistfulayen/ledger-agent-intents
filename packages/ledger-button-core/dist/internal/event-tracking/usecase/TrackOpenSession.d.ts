import { Config } from '../../config/model/config.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { EventTrackingService } from '../service/EventTrackingService.js';
export declare class TrackOpenSession {
    private readonly eventTrackingService;
    private readonly config;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, eventTrackingService: EventTrackingService, config: Config);
    execute(): Promise<void>;
}
//# sourceMappingURL=TrackOpenSession.d.ts.map