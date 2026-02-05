import { DeviceModelId } from '@ledgerhq/device-management-kit';
import { LedgerButtonError } from './LedgerButtonError.js';
export declare class DeviceNotSupportedError extends LedgerButtonError<{
    modelId: DeviceModelId;
}> {
    constructor(message: string, context: {
        modelId: DeviceModelId;
    });
}
export declare class DeviceDisconnectedError extends LedgerButtonError<{
    deviceModel?: string;
    connectionType?: "bluetooth" | "usb";
}> {
    constructor(message: string, context?: {
        deviceModel?: string;
        connectionType?: "bluetooth" | "usb";
    });
}
export declare class IncorrectSeedError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class BlindSigningDisabledError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class UserRejectedTransactionError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
//# sourceMappingURL=DeviceErrors.d.ts.map