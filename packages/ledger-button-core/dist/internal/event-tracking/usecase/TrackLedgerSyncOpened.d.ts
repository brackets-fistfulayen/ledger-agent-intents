import { Factory } from 'inversify';
import { Config } from '../../config/model/config.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { EventTrackingService } from '../service/EventTrackingService.js';
export declare class TrackLedgerSyncOpened {
    private readonly eventTrackingService;
    private readonly config;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, eventTrackingService: EventTrackingService, config: Config);
    execute(): Promise<void>;
}
//# sourceMappingURL=TrackLedgerSyncOpened.d.ts.map