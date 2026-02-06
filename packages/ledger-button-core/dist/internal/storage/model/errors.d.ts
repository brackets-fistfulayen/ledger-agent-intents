import { LedgerButtonError } from '../../../api/errors/LedgerButtonError.js';
export declare class StorageIDBOpenError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class StorageIDBNotInitializedError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class StorageIDBStoreError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class StorageIDBGetError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class StorageIDBRemoveError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export type StorageIDBErrors = StorageIDBOpenError | StorageIDBNotInitializedError | StorageIDBStoreError | StorageIDBGetError | StorageIDBRemoveError;
export type StorageErrors = StorageIDBErrors;
//# sourceMappingURL=errors.d.ts.map