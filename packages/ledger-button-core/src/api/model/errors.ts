import { LedgerButtonError } from "../errors/LedgerButtonError.js";

export class LedgerSyncAuthenticationError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "LedgerSyncAuthenticationError", context);
  }
}
