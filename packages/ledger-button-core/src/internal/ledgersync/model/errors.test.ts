import { describe, expect, it } from "vitest";

import { LedgerButtonError } from "../../../api/errors/LedgerButtonError.js";
import {
  LedgerKeyringProtocolError,
  LedgerSyncAuthContextMissingError,
  LedgerSyncConnectionFailedError,
  LedgerSyncError,
  LedgerSyncNoSessionIdError,
} from "./errors.js";

describe.each([
  [
    LedgerSyncError,
    "LedgerSyncError",
    "Ledger sync failed",
    { userId: "123", action: "sync" },
  ],
  [
    LedgerSyncAuthContextMissingError,
    "LedgerSyncAuthContextMissingError",
    "Auth context is missing",
    { attemptedAction: "decrypt", timestamp: 1234567890 },
  ],
  [
    LedgerSyncNoSessionIdError,
    "LedgerSyncNoSessionIdError",
    "No session ID available",
    { deviceConnected: false, attemptedAt: "2025-10-20" },
  ],
  [
    LedgerSyncConnectionFailedError,
    "LedgerSyncConnectionFailedError",
    "Connection failed",
    { errorCode: 500, retries: 3, url: "https://api.ledger.com" },
  ],
  [
    LedgerKeyringProtocolError,
    "LedgerKeyringProtocolError",
    "LKRP authentication failed",
    { errorType: "AuthError", originalError: '{"message":"failed"}' },
  ],
])("%s", (ErrorClass, expectedName, message, context) => {
  it("should create error with message and context", () => {
    const error = new ErrorClass(message, context);

    expect(error).toBeInstanceOf(LedgerButtonError);
    expect(error.name).toBe(expectedName);
    expect(error.message).toBe(message);
    expect(error.context).toEqual(context);
  });
});
