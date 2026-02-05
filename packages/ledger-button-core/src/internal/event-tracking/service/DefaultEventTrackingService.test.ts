import { Left, Right } from "purify-ts";
import { BehaviorSubject } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ButtonCoreContext } from "../../../api/model/ButtonCoreContext.js";
import type { BackendService } from "../../backend/BackendService.js";
import type { EventRequest } from "../../backend/model/trackEvent.js";
import { EventType } from "../../backend/model/trackEvent.js";
import type { Config } from "../../config/model/config.js";
import type { ContextService } from "../../context/ContextService.js";
import { DefaultEventTrackingService } from "./DefaultEventTrackingService.js";

/**
 * Helper to wait for a condition to be met by polling the check function
 * Uses microtasks instead of setTimeout for better determinism
 */
async function waitForCondition(
  check: () => boolean,
  maxAttempts = 100,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (check()) {
      return;
    }
    await Promise.resolve();
  }
  throw new Error("Condition not met within max attempts");
}

describe("DefaultEventTrackingService", () => {
  let eventTrackingService: DefaultEventTrackingService;
  let mockBackendService: {
    event: ReturnType<typeof vi.fn>;
  };
  let mockConfig: {
    dAppIdentifier: string;
  };
  let mockContextService: {
    getContext: ReturnType<typeof vi.fn>;
    observeContext: ReturnType<typeof vi.fn>;
    onEvent: ReturnType<typeof vi.fn>;
  };
  let contextSubject: BehaviorSubject<ButtonCoreContext>;

  const createMockContext = (
    overrides: Partial<ButtonCoreContext> = {},
  ): ButtonCoreContext => ({
    connectedDevice: undefined,
    selectedAccount: undefined,
    trustChainId: undefined,
    applicationPath: undefined,
    chainId: 1,
    welcomeScreenCompleted: false,
    hasTrackingConsent: false,
    ...overrides,
  });

  const createMockEvent = (
    type: EventType,
    eventType: string,
  ): EventRequest => ({
    name: "Test Event",
    type,
    data: {
      event_type: eventType,
      event_id: "test-id",
      transaction_dapp_id: "test-dapp",
      timestamp_ms: Date.now(),
    } as EventRequest["data"],
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockBackendService = {
      event: vi.fn().mockResolvedValue(Right({ success: true })),
    };

    mockConfig = {
      dAppIdentifier: "test-dapp",
    };

    const mockLoggerFactory = vi.fn().mockReturnValue({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    });

    contextSubject = new BehaviorSubject<ButtonCoreContext>(
      createMockContext(),
    );

    mockContextService = {
      getContext: vi.fn().mockReturnValue(createMockContext()),
      observeContext: vi.fn().mockReturnValue(contextSubject.asObservable()),
      onEvent: vi.fn(),
    };

    eventTrackingService = new DefaultEventTrackingService(
      mockBackendService as unknown as BackendService,
      mockConfig as unknown as Config,
      mockLoggerFactory,
      mockContextService as unknown as ContextService,
    );
  });

  describe("getSessionId", () => {
    it("should return a session ID", () => {
      const sessionId = eventTrackingService.getSessionId();
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      expect(sessionId).toMatch(uuidPattern);
    });
  });

  describe("trackEvent", () => {
    describe("billing events (InvoicingTransactionSigned)", () => {
      it("should ALWAYS track InvoicingTransactionSigned even without consent", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: false }),
        );

        const event = createMockEvent(
          EventType.InvoicingTransactionSigned,
          "invoicing_transaction_signed",
        );

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).toHaveBeenCalledWith(
          event,
          mockConfig.dAppIdentifier,
        );
      });

      it("should track InvoicingTransactionSigned with consent", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: true }),
        );

        const event = createMockEvent(
          EventType.InvoicingTransactionSigned,
          "invoicing_transaction_signed",
        );

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).toHaveBeenCalledWith(
          event,
          mockConfig.dAppIdentifier,
        );
      });
    });

    describe("consent events (ConsentGiven)", () => {
      it("should ALWAYS track ConsentGiven even without consent", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: false }),
        );

        const event = createMockEvent(EventType.ConsentGiven, "consent_given");

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).toHaveBeenCalledWith(
          event,
          mockConfig.dAppIdentifier,
        );
      });

      it("should track ConsentGiven with consent", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: true }),
        );

        const event = createMockEvent(EventType.ConsentGiven, "consent_given");

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).toHaveBeenCalledWith(
          event,
          mockConfig.dAppIdentifier,
        );
      });
    });

    describe("analytics events (consent-based)", () => {
      it("should NOT track analytics events when user has refused consent", async () => {
        const context = createMockContext({ hasTrackingConsent: false });
        mockContextService.getContext.mockReturnValue(context);
        contextSubject.next(context);

        const event = createMockEvent(
          EventType.TypedMessageFlowInitialization,
          "typed_message_flow_initialization",
        );

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).not.toHaveBeenCalled();
      });

      it("should queue analytics events when consent is undefined", async () => {
        const context = createMockContext({ hasTrackingConsent: undefined });
        mockContextService.getContext.mockReturnValue(context);
        contextSubject.next(context);

        const event = createMockEvent(
          EventType.TypedMessageFlowInitialization,
          "typed_message_flow_initialization",
        );

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).not.toHaveBeenCalled();
      });

      it("should track TypedMessageFlowInitialization when consent is given", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: true }),
        );

        const event = createMockEvent(
          EventType.TypedMessageFlowInitialization,
          "typed_message_flow_initialization",
        );

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).toHaveBeenCalledWith(
          event,
          mockConfig.dAppIdentifier,
        );
      });

      it("should track TransactionFlowInitialization when consent is given", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: true }),
        );

        const event = createMockEvent(
          EventType.TransactionFlowInitialization,
          "transaction_flow_initialization",
        );

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).toHaveBeenCalledWith(
          event,
          mockConfig.dAppIdentifier,
        );
      });
    });

    describe("error handling", () => {
      it("should handle backend errors gracefully", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: true }),
        );
        mockBackendService.event.mockResolvedValue(
          Left(new Error("Backend error")),
        );

        const event = createMockEvent(
          EventType.InvoicingTransactionSigned,
          "invoicing_transaction_signed",
        );

        await eventTrackingService.trackEvent(event);
      });

      it("should handle exceptions gracefully", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: true }),
        );
        mockBackendService.event.mockRejectedValue(new Error("Network error"));

        const event = createMockEvent(
          EventType.InvoicingTransactionSigned,
          "invoicing_transaction_signed",
        );

        await eventTrackingService.trackEvent(event);
      });

      it("should log success when event is tracked successfully", async () => {
        mockContextService.getContext.mockReturnValue(
          createMockContext({ hasTrackingConsent: true }),
        );
        mockBackendService.event.mockResolvedValue(Right({ success: true }));

        const event = createMockEvent(
          EventType.InvoicingTransactionSigned,
          "invoicing_transaction_signed",
        );

        await eventTrackingService.trackEvent(event);
      });
    });

    describe("event queue", () => {
      it("should flush queued events when consent becomes true", async () => {
        const contextUndefined = createMockContext({
          hasTrackingConsent: undefined,
        });
        mockContextService.getContext.mockReturnValue(contextUndefined);
        contextSubject.next(contextUndefined);

        const event1 = createMockEvent(
          EventType.TypedMessageFlowInitialization,
          "typed_message_flow_initialization",
        );
        const event2 = createMockEvent(
          EventType.TransactionFlowInitialization,
          "transaction_flow_initialization",
        );

        await eventTrackingService.trackEvent(event1);
        await eventTrackingService.trackEvent(event2);

        expect(mockBackendService.event).not.toHaveBeenCalled();

        const contextTrue = createMockContext({ hasTrackingConsent: true });
        mockContextService.getContext.mockReturnValue(contextTrue);
        
        contextSubject.next(contextTrue);
        
        // Wait for the flush to complete by waiting for both events to be processed
        await waitForCondition(
          () => mockBackendService.event.mock.calls.length >= 2,
        );

        expect(mockBackendService.event).toHaveBeenCalledTimes(2);
        expect(mockBackendService.event).toHaveBeenCalledWith(
          event1,
          mockConfig.dAppIdentifier,
        );
        expect(mockBackendService.event).toHaveBeenCalledWith(
          event2,
          mockConfig.dAppIdentifier,
        );
      });

      it("should clear queued events when consent becomes false", async () => {
        const contextUndefined = createMockContext({
          hasTrackingConsent: undefined,
        });
        mockContextService.getContext.mockReturnValue(contextUndefined);
        contextSubject.next(contextUndefined);

        const event = createMockEvent(
          EventType.TypedMessageFlowInitialization,
          "typed_message_flow_initialization",
        );

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).not.toHaveBeenCalled();

        const contextFalse = createMockContext({ hasTrackingConsent: false });
        mockContextService.getContext.mockReturnValue(contextFalse);
        contextSubject.next(contextFalse);

        // Clear queue is synchronous, but wait a tick to ensure subscription processed
        await Promise.resolve();

        expect(mockBackendService.event).not.toHaveBeenCalled();
      });

      it("should not queue always-tracked events even when consent is undefined", async () => {
        const contextUndefined = createMockContext({
          hasTrackingConsent: undefined,
        });
        mockContextService.getContext.mockReturnValue(contextUndefined);
        contextSubject.next(contextUndefined);

        const event = createMockEvent(
          EventType.InvoicingTransactionSigned,
          "invoicing_transaction_signed",
        );

        await eventTrackingService.trackEvent(event);

        expect(mockBackendService.event).toHaveBeenCalledWith(
          event,
          mockConfig.dAppIdentifier,
        );
      });


      it("should process events immediately after flush completes", async () => {
        const contextUndefined = createMockContext({
          hasTrackingConsent: undefined,
        });
        mockContextService.getContext.mockReturnValue(contextUndefined);
        contextSubject.next(contextUndefined);

        const queuedEvent = createMockEvent(
          EventType.TypedMessageFlowInitialization,
          "typed_message_flow_initialization",
        );

        await eventTrackingService.trackEvent(queuedEvent);

        const contextTrue = createMockContext({ hasTrackingConsent: true });
        mockContextService.getContext.mockReturnValue(contextTrue);
        contextSubject.next(contextTrue);

        await waitForCondition(
          () => mockBackendService.event.mock.calls.length >= 1,
        );

        const eventAfterFlush = createMockEvent(
          EventType.WalletActionClicked,
          "wallet_action_clicked",
        );

        await eventTrackingService.trackEvent(eventAfterFlush);

        expect(mockBackendService.event).toHaveBeenCalledTimes(2);
        expect(mockBackendService.event).toHaveBeenNthCalledWith(
          1,
          queuedEvent,
          mockConfig.dAppIdentifier,
        );
        expect(mockBackendService.event).toHaveBeenNthCalledWith(
          2,
          eventAfterFlush,
          mockConfig.dAppIdentifier,
        );
      });
    });
  });
});