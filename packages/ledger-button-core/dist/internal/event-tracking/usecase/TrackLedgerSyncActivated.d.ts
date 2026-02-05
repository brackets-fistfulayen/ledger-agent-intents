import { Factory } from 'inversify';
import { Config } from '../../config/model/config.js';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { EventTrackingService } from '../service/EventTrackingService.js';
export declare class TrackLedgerSyncActivated {
    private readonly eventTrackingService;
    private readonly config;
    private readonly contextService;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, eventTrackingService: EventTrackingService, config: Config, contextService: ContextService);
    execute(): Promise<void>;
}
//# sourceMappingURL=TrackLedgerSyncActivated.d.ts.map