import { EventRequest } from '../backend/model/trackEvent.js';
interface ErrorTrackingParams {
    error: Error;
    sessionId: string;
    dAppId: string;
    severity: "fatal" | "error";
}
export declare const sanitizeContext: (context?: Record<string, unknown>) => Record<string, unknown> | undefined;
export declare const categorizeError: (error: Error) => string;
export declare const createErrorEvent: (params: ErrorTrackingParams) => EventRequest;
export {};
//# sourceMappingURL=ErrorTrackingUtils.d.ts.map