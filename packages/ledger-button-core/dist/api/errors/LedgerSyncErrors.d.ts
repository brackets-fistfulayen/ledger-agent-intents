import { LedgerButtonError } from './LedgerButtonError.js';
export declare class NoCompatibleAccountsError extends LedgerButtonError<{
    networks: string[];
}> {
    constructor(message: string, context?: {
        networks: string[];
    });
}
export declare class NoAccountInSyncError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class FailedToFetchEncryptedAccountsError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class NoSelectedAccountError extends LedgerButtonError {
    constructor(message?: string);
}
export declare class AccountNotFoundError extends LedgerButtonError<{
    address: string;
}> {
    constructor(message: string, context: {
        address: string;
    });
}
//# sourceMappingURL=LedgerSyncErrors.d.ts.map