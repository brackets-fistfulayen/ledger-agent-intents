/**
 * Base error class for all Ledger Button Core errors.
 * Provides error name, context, timestamp, and serialization support.
 */
export class LedgerButtonError<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Error {
  /** Optional context or metadata for debugging */
  public readonly context?: T;
  /** Timestamp when the error was created */
  public readonly timestamp: Date;

  /**
   * @param message Human-readable error message
   * @param name Error name/type (default: 'LedgerButtonError')
   * @param context Optional additional context or metadata
   */
  constructor(message: string, name = "LedgerButtonError", context?: T) {
    super(message);
    this.name = name;
    this.context = context;
    this.timestamp = new Date();

    // Maintain proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize the error to a plain object (useful for logging or transport)
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}
