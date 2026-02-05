import { EventRequest } from '../../backend/model/trackEvent.js';
import { EventTrackingService } from './EventTrackingService.js';
export declare class StubEventTrackingService implements EventTrackingService {
    getSessionId(): string;
    trackEvent(_event: EventRequest): Promise<void>;
}
//# sourceMappingURL=StubEventTrackingService.d.ts.map