import { LedgerButtonError } from "../../../api/errors/LedgerButtonError.js";

export class LedgerSyncError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "LedgerSyncError", context);
  }
}

export class LedgerSyncAuthContextMissingError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "LedgerSyncAuthContextMissingError", context);
  }
}

export class LedgerSyncNoSessionIdError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "LedgerSyncNoSessionIdError", context);
  }
}

export class LedgerSyncConnectionFailedError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "LedgerSyncConnectionFailedError", context);
  }
}

export class LedgerKeyringProtocolError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "LedgerKeyringProtocolError", context);
  }
}

export type LedgerSyncErrors =
  | LedgerSyncError
  | LedgerSyncAuthContextMissingError
  | LedgerSyncNoSessionIdError
  | LedgerSyncConnectionFailedError
  | LedgerKeyringProtocolError;
