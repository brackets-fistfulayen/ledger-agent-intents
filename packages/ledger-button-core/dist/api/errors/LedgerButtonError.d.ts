/**
 * Base error class for all Ledger Button Core errors.
 * Provides error name, context, timestamp, and serialization support.
 */
export declare class LedgerButtonError<T extends Record<string, unknown> = Record<string, unknown>> extends Error {
    /** Optional context or metadata for debugging */
    readonly context?: T;
    /** Timestamp when the error was created */
    readonly timestamp: Date;
    /**
     * @param message Human-readable error message
     * @param name Error name/type (default: 'LedgerButtonError')
     * @param context Optional additional context or metadata
     */
    constructor(message: string, name?: string, context?: T);
    /**
     * Serialize the error to a plain object (useful for logging or transport)
     */
    toJSON(): {
        name: string;
        message: string;
        context: T;
        timestamp: Date;
        stack: string;
    };
}
//# sourceMappingURL=LedgerButtonError.d.ts.map