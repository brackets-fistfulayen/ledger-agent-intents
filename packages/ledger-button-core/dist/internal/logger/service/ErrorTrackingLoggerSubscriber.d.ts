import { EventRequest } from '../../backend/model/trackEvent.js';
import { ErrorTrackingConfig } from '../../event-tracking/config/ErrorTrackingConfig.js';
import { LogData } from './LoggerPublisher.js';
import { LoggerSubscriber } from './LoggerSubscriber.js';
export declare class ErrorTrackingLoggerSubscriber implements LoggerSubscriber {
    private readonly config;
    private readonly sessionId;
    private readonly dAppId;
    private readonly trackEvent;
    constructor(params: {
        sessionId: string | (() => string);
        dAppId: string | (() => string);
        trackEvent: (event: EventRequest) => void;
        config?: ErrorTrackingConfig;
    });
    private getSessionId;
    private getDAppId;
    log(level: number, _message: string, data: LogData): void;
    private extractError;
}
//# sourceMappingURL=ErrorTrackingLoggerSubscriber.d.ts.map