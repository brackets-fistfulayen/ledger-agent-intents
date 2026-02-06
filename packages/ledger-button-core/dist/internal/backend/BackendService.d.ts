import { Either } from 'purify-ts';
import { EventRequest, EventResponse } from './model/trackEvent.ts';
import { BroadcastRequest, BroadcastResponse, ConfigRequest, ConfigResponse, ConfigResponseError } from './types.js';
export interface BackendService {
    broadcast(request: BroadcastRequest, clientOrigin?: string, domain?: string): Promise<Either<Error, BroadcastResponse>>;
    getConfig(request: ConfigRequest, domain?: string): Promise<Either<ConfigResponseError, ConfigResponse>>;
    event(request: EventRequest, domain?: string): Promise<Either<Error, EventResponse>>;
}
//# sourceMappingURL=BackendService.d.ts.map