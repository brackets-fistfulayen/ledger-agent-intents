import { beforeEach, describe, expect, it, vi } from "vitest";

import { LedgerButtonError } from "../../../api/errors/LedgerButtonError.js";
import {
  ErrorOccurredEventData,
  EventRequest,
  EventType,
} from "../../backend/model/trackEvent.js";
import { LOG_LEVELS } from "../model/constant.js";
import { ErrorTrackingLoggerSubscriber } from "./ErrorTrackingLoggerSubscriber.js";

describe("ErrorTrackingLoggerSubscriber", () => {
  let subscriber: ErrorTrackingLoggerSubscriber;
  let trackEvent: (event: EventRequest) => void;
  let getSessionId: () => string;

  beforeEach(() => {
    trackEvent = vi.fn();
    getSessionId = vi.fn().mockReturnValue("test-session-123");
  });

  describe("when error tracking is enabled with whitelist", () => {
    beforeEach(() => {
      subscriber = new ErrorTrackingLoggerSubscriber({
        sessionId: getSessionId,
        dAppId: () => "test-dapp-id",
        trackEvent,
        config: {
          enabled: true,
          useWhitelist: true,
          whitelist: new Set([
            "BlindSigningDisabledError",
            "DeviceConnectionError",
            "SignTransactionError",
          ]),
        },
      });
    });

    describe("error level logs", () => {
      it.each([
        {
          errorName: "BlindSigningDisabledError",
          errorMessage: "Blind signing is disabled",
          logMessage: "Transaction failed",
          tag: "transaction",
          category: "blind-signing",
        },
        {
          errorName: "DeviceConnectionError",
          errorMessage: "Device not found",
          logMessage: "Device error",
          tag: "device",
          category: "device",
        },
        {
          errorName: "SignTransactionError",
          errorMessage: "Transaction signing failed",
          logMessage: "Signing failed",
          tag: "transaction",
          category: "transaction",
        },
      ])(
        "should track $errorName at error level",
        ({ errorName, errorMessage, logMessage, tag, category }) => {
          const error = new Error(errorMessage);
          error.name = errorName;

          subscriber.log(LOG_LEVELS.error, logMessage, {
            tag,
            data: { error },
            timestamp: new Date().toISOString(),
          });

          expect(trackEvent).toHaveBeenCalledTimes(1);
          expect(trackEvent).toHaveBeenCalledWith(
            expect.objectContaining({
              name: EventType.ErrorOccurred,
              type: EventType.ErrorOccurred,
              data: expect.objectContaining({
                event_type: EventType.ErrorOccurred,
                error_type: errorName,
                error_message: errorMessage,
                error_category: category,
                session_id: "test-session-123",
                transaction_dapp_id: "test-dapp-id",
              }),
            }),
          );
        },
      );

      it("should NOT track non-whitelisted errors", () => {
        const error = new Error("Some random error");
        error.name = "RandomError";

        subscriber.log(LOG_LEVELS.error, "Error occurred", {
          tag: "test",
          data: { error },
          timestamp: new Date().toISOString(),
        });

        expect(trackEvent).not.toHaveBeenCalled();
      });
    });

    describe("LedgerButtonError with context", () => {
      it("should track LedgerButtonError and include sanitized context", () => {
        const error = new LedgerButtonError(
          "Transaction failed",
          "SignTransactionError",
          {
            transactionId: "tx-123",
            chainId: 1,
            amount: "100",
          },
        );

        subscriber.log(LOG_LEVELS.error, "Error occurred", {
          tag: "transaction",
          data: { error },
          timestamp: new Date().toISOString(),
        });

        expect(trackEvent).toHaveBeenCalledTimes(1);
        const call = vi.mocked(trackEvent).mock.calls[0][0];
        const eventData = call.data as ErrorOccurredEventData;
        expect(eventData.error_type).toBe("SignTransactionError");
        expect(eventData.error_message).toBe("Transaction failed");
        expect(eventData.error_data).toBeDefined();
      });

      it("should sanitize PII from LedgerButtonError context", () => {
        const error = new LedgerButtonError(
          "Sync error",
          "BlindSigningDisabledError",
          {
            ledger_sync_id: "should-be-removed",
            timestamp: Date.now(),
          },
        );

        subscriber.log(LOG_LEVELS.error, "Error occurred", {
          tag: "test",
          data: { error },
          timestamp: new Date().toISOString(),
        });

        expect(trackEvent).toHaveBeenCalledTimes(1);
        const call = vi.mocked(trackEvent).mock.calls[0][0];
        const eventData = call.data as ErrorOccurredEventData;
        const errorData = eventData.error_data;

        expect(errorData).not.toHaveProperty("ledgerSyncId");
      });
    });

    describe("missing or invalid error object", () => {
      it("should NOT track when no error object is found in log data", () => {
        subscriber.log(LOG_LEVELS.error, "Error message without error object", {
          tag: "test",
          data: { someOtherData: "value" },
          timestamp: new Date().toISOString(),
        });

        expect(trackEvent).not.toHaveBeenCalled();
      });

      it("should NOT track when log data is undefined", () => {
        subscriber.log(LOG_LEVELS.error, "Error message", {
          tag: "test",
          data: undefined,
          timestamp: new Date().toISOString(),
        });

        expect(trackEvent).not.toHaveBeenCalled();
      });

      it("should NOT track when error is null", () => {
        subscriber.log(LOG_LEVELS.error, "Error message", {
          tag: "test",
          data: { error: null },
          timestamp: new Date().toISOString(),
        });

        expect(trackEvent).not.toHaveBeenCalled();
      });

      it("should NOT track when error is not an Error instance", () => {
        subscriber.log(LOG_LEVELS.error, "Error message", {
          tag: "test",
          data: { error: "string error" },
          timestamp: new Date().toISOString(),
        });

        expect(trackEvent).not.toHaveBeenCalled();
      });
    });

    describe("session ID", () => {
      it("should include session ID from EventTrackingService", () => {
        const error = new Error("Test error");
        error.name = "BlindSigningDisabledError";

        subscriber.log(LOG_LEVELS.error, "Error occurred", {
          tag: "test",
          data: { error },
          timestamp: new Date().toISOString(),
        });

        expect(getSessionId).toHaveBeenCalledTimes(1);
        expect(trackEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              session_id: "test-session-123",
            }),
          }),
        );
      });

      it("should call getSessionId for each tracked error", () => {
        const error1 = new Error("Error 1");
        error1.name = "BlindSigningDisabledError";

        const error2 = new Error("Error 2");
        error2.name = "DeviceConnectionError";

        subscriber.log(LOG_LEVELS.error, "Error 1", {
          tag: "test",
          data: { error: error1 },
          timestamp: new Date().toISOString(),
        });

        subscriber.log(LOG_LEVELS.error, "Error 2", {
          tag: "test",
          data: { error: error2 },
          timestamp: new Date().toISOString(),
        });

        expect(getSessionId).toHaveBeenCalledTimes(2);
        expect(trackEvent).toHaveBeenCalledTimes(2);
      });
    });

    describe("error categorization", () => {
      it.each([
        {
          errorName: "BlindSigningDisabledError",
          errorMessage: "Blind signing disabled",
          category: "blind-signing",
        },
        {
          errorName: "DeviceConnectionError",
          errorMessage: "Device error",
          category: "device",
        },
        {
          errorName: "SignTransactionError",
          errorMessage: "Transaction error",
          category: "transaction",
        },
      ])(
        "should categorize $errorName as $category",
        ({ errorName, errorMessage, category }) => {
          const error = new Error(errorMessage);
          error.name = errorName;

          subscriber.log(LOG_LEVELS.error, "Error occurred", {
            tag: "test",
            data: { error },
            timestamp: new Date().toISOString(),
          });

          expect(trackEvent).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                error_category: category,
              }),
            }),
          );
        },
      );
    });
  });

  describe("when error tracking is disabled", () => {
    beforeEach(() => {
      subscriber = new ErrorTrackingLoggerSubscriber({
        sessionId: getSessionId,
        dAppId: () => "test-dapp-id",
        trackEvent,
        config: {
          enabled: false,
          useWhitelist: true,
          whitelist: new Set(["BlindSigningDisabledError"]),
        },
      });
    });

    it("should NOT track any errors when disabled", () => {
      const error = new Error("Blind signing disabled");
      error.name = "BlindSigningDisabledError";

      subscriber.log(LOG_LEVELS.error, "Error occurred", {
        tag: "test",
        data: { error },
        timestamp: new Date().toISOString(),
      });

      expect(trackEvent).not.toHaveBeenCalled();
    });
  });

  describe("async tracking", () => {
    it("should call trackEvent asynchronously (fire and forget)", () => {
      const error = new Error("Async error");
      error.name = "BlindSigningDisabledError";

      subscriber = new ErrorTrackingLoggerSubscriber({
        sessionId: getSessionId,
        dAppId: () => "test-dapp-id",
        trackEvent,
        config: {
          enabled: true,
          useWhitelist: true,
          whitelist: new Set(["BlindSigningDisabledError"]),
        },
      });

      subscriber.log(LOG_LEVELS.error, "Error occurred", {
        tag: "test",
        data: { error },
        timestamp: new Date().toISOString(),
      });

      expect(trackEvent).toHaveBeenCalledTimes(1);
    });
  });
});
