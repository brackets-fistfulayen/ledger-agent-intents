import { BackendService } from '../../backend/BackendService.js';
import { EventRequest } from '../../backend/model/trackEvent.js';
import { Config } from '../../config/model/config.js';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { EventTrackingService } from './EventTrackingService.js';
export declare class DefaultEventTrackingService implements EventTrackingService {
    private readonly backendService;
    private readonly config;
    private readonly contextService;
    private static readonly ALWAYS_TRACKED_EVENTS;
    private readonly logger;
    private _sessionId;
    private eventQueue;
    private isFlushing;
    constructor(backendService: BackendService, config: Config, loggerFactory: LoggerPublisherFactory, contextService: ContextService);
    getSessionId(): string;
    trackEvent(event: EventRequest): Promise<void>;
    private isAlwaysTrackedEvent;
    private getConsentStatus;
    private processEvent;
    private subscribeToContextChanges;
    private flushQueue;
    private clearQueue;
}
//# sourceMappingURL=DefaultEventTrackingService.d.ts.map