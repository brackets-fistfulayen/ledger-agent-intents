import { LedgerButtonError } from '../../../api/errors/LedgerButtonError.js';
export type DeviceConnectionErrorType = "no-accessible-device" | "failed-to-start-discovery" | "failed-to-connect" | "failed-to-disconnect" | "not-connected";
export declare class DeviceConnectionError extends LedgerButtonError<{
    type: DeviceConnectionErrorType;
    error?: unknown;
}> {
    constructor(message: string, context?: {
        type: DeviceConnectionErrorType;
        error?: unknown;
    });
}
export declare class SignTransactionError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class AccountNotSelectedError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class FailToOpenAppError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export type DeviceServiceErrors = DeviceConnectionError | SignTransactionError | AccountNotSelectedError;
//# sourceMappingURL=errors.d.ts.map