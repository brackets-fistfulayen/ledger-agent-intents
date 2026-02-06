import { LedgerButtonError } from '../../../api/errors/LedgerButtonError.js';
export declare class LedgerSyncError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class LedgerSyncAuthContextMissingError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class LedgerSyncNoSessionIdError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class LedgerSyncConnectionFailedError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class LedgerKeyringProtocolError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export type LedgerSyncErrors = LedgerSyncError | LedgerSyncAuthContextMissingError | LedgerSyncNoSessionIdError | LedgerSyncConnectionFailedError | LedgerKeyringProtocolError;
//# sourceMappingURL=errors.d.ts.map