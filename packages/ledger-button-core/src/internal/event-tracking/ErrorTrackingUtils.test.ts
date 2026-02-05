import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LedgerButtonError } from "../../api/errors/LedgerButtonError.js";
import type { ErrorOccurredEventData } from "../backend/model/trackEvent.js";
import { EventType } from "../backend/model/trackEvent.js";
import {
  categorizeError,
  createErrorEvent,
  sanitizeContext,
} from "./ErrorTrackingUtils.js";

vi.mock("./utils.js", () => ({
  generateUUID: vi.fn().mockReturnValue("mock-uuid-1234"),
}));

describe("ErrorTrackingUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("sanitizeContext", () => {
    it("should preserve non-PII fields", () => {
      const context = {
        errorCode: "E001",
        chainId: 1,
        transactionType: "transfer",
      };
      const result = sanitizeContext(context);
      expect(result).toEqual({
        errorCode: "E001",
        chainId: 1,
        transactionType: "transfer",
      });
    });

    it("should remove fields containing ledger_sync_id (case insensitive)", () => {
      const context = {
        ledger_sync_id: "sensitive-id",
        safeField: "safe-value",
      };
      const result = sanitizeContext(context);
      expect(result).toEqual({
        safeField: "safe-value",
      });
    });
  });

  describe("categorizeError", () => {
    it.each([
      ["AccountNotSelectedError", "account"],
      ["BlindSigningDisabledError", "blind-signing"],
      ["DeviceConnectionError", "device"],
      ["DeviceNotSupportedError", "device"],
      ["DeviceDisconnectedError", "device"],
      ["FailToOpenAppError", "device"],
      ["IncorrectSeedError", "device"],
      ["SignTransactionError", "transaction"],
      ["UserRejectedTransactionError", "transaction"],
      ["TransactionValidationError", "transaction"],
      ["LedgerSyncConnectionError", "ledgersync"],
      ["LedgerSyncAuthenticationError", "ledgersync"],
      ["LedgerKeyringProtocolError", "ledgersync"],
      ["LedgerSyncConnectionFailedError", "ledgersync"],
      ["LedgerSyncError", "ledgersync"],
      ["LedgerSyncAuthContextMissingError", "ledgersync"],
      ["LedgerSyncNoSessionIdError", "ledgersync"],
      ["SomeRandomError", "unknown"],
      ["Error", "unknown"],
    ])("should categorize %s as %s", (errorName, expectedCategory) => {
      const error = new Error("Test error");
      error.name = errorName;
      expect(categorizeError(error)).toBe(expectedCategory);
    });
  });

  describe("createErrorEvent", () => {
    it("should create an error event with correct structure", () => {
      const error = new Error("Test error message");
      error.name = "DeviceConnectionError";

      const result = createErrorEvent({
        error,
        sessionId: "test-session-id",
        dAppId: "test-dapp-id",
        severity: "error",
      });

      expect(result).toEqual({
        name: EventType.ErrorOccurred,
        type: EventType.ErrorOccurred,
        data: {
          event_id: "mock-uuid-1234",
          transaction_dapp_id: "test-dapp-id",
          timestamp_ms: 1705312800000,
          event_type: EventType.ErrorOccurred,
          session_id: "test-session-id",
          error_type: "DeviceConnectionError",
          error_code: undefined,
          error_message: "Test error message",
          error_category: "device",
          error_data: undefined,
        },
      });
    });

    it("should include sanitized context for LedgerButtonError", () => {
      const error = new LedgerButtonError(
        "Ledger button error",
        "LedgerSyncError",
        {
          chainId: 1,
          transactionId: "tx-123",
        },
      );

      const result = createErrorEvent({
        error,
        sessionId: "session-id",
        dAppId: "dapp-id",
        severity: "error",
      });

      const data = result.data as ErrorOccurredEventData;
      expect(data.error_data).toEqual({
        chainId: 1,
        transactionId: "tx-123",
      });
    });

    it("should sanitize PII from LedgerButtonError context", () => {
      const error = new LedgerButtonError(
        "Ledger button error with PII",
        "LedgerSyncAuthenticationError",
        {
          ledger_sync_id: "sensitive-sync-id",
          chainId: 1,
          safeData: "safe",
        },
      );

      const result = createErrorEvent({
        error,
        sessionId: "session-id",
        dAppId: "dapp-id",
        severity: "error",
      });

      const data = result.data as ErrorOccurredEventData;
      expect(data.error_data).toEqual({
        chainId: 1,
        safeData: "safe",
      });
      expect(data.error_data).not.toHaveProperty("ledger_sync_id");
    });

    it.each([
      {
        description: "standard Error",
        error: (() => {
          const e = new Error("Standard error");
          e.name = "TransactionValidationError";
          return e;
        })(),
      },
      {
        description: "LedgerButtonError without context",
        error: new LedgerButtonError(
          "Error without context",
          "DeviceDisconnectedError",
        ),
      },
      {
        description: "LedgerButtonError with only PII fields",
        error: new LedgerButtonError(
          "Error with only PII",
          "LedgerSyncConnectionError",
          {
            ledger_sync_id: "sensitive",
            user_ledger_sync_id: "also-sensitive",
          },
        ),
      },
    ])("should set error_data to undefined for $description", ({ error }) => {
      const result = createErrorEvent({
        error,
        sessionId: "session-id",
        dAppId: "dapp-id",
        severity: "error",
      });

      const data = result.data as ErrorOccurredEventData;
      expect(data.error_data).toBeUndefined();
    });

    it("should categorize error correctly in the event", () => {
      const error = new Error("Account error");
      error.name = "AccountNotSelectedError";

      const result = createErrorEvent({
        error,
        sessionId: "session-id",
        dAppId: "dapp-id",
        severity: "error",
      });

      const data = result.data as ErrorOccurredEventData;
      expect(data.error_category).toBe("account");
    });
  });
});
