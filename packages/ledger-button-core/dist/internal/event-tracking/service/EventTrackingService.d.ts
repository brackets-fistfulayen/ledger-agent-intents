import { EventRequest } from '../../backend/model/trackEvent.js';
export interface EventTrackingService {
    getSessionId(): string;
    trackEvent(event: EventRequest): Promise<void>;
}
//# sourceMappingURL=EventTrackingService.d.ts.map