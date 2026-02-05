import { injectable } from "inversify";

import type { EventRequest } from "../../backend/model/trackEvent.js";
import type { EventTrackingService } from "./EventTrackingService.js";

@injectable()
export class StubEventTrackingService implements EventTrackingService {
  getSessionId(): string {
    return "session-id-123";
  }

  async trackEvent(_event: EventRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
