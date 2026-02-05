import { describe, expect, it } from "vitest";

import type {
  InvoicingTransactionSignedEventData,
  TransactionFlowCompletionEventData,
} from "../backend/model/trackEvent.js";
import { EventTrackingUtils } from "./EventTrackingUtils.js";

describe("EventTrackingUtils", () => {
  describe("validateEvent", () => {
    it("should validate a correctly formatted invoicing event", () => {
      const event = EventTrackingUtils.createInvoicingTransactionSignedEvent({
        dAppId: "test-dapp",
        sessionId: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        transactionHash:
          "0xcaf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
        recipientAddress: "0x111111125421cA6dc452d289314280a0f8842A65",
        chainId: "1",
        unsignedTransactionHash: "0x02f90552017a8427e021408427e021408304c04c",
      });

      const result = EventTrackingUtils.validateEvent(event);

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should validate a correctly formatted transaction flow completion event", () => {
      const event = EventTrackingUtils.createTransactionFlowCompletionEvent({
        dAppId: "test-dapp",
        sessionId: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        unsignedTransactionHash: "0x02f90552017a8427e021408427e021408304c04c",
        chainId: "1",
        transactionHash:
          "0xcaf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      });

      const result = EventTrackingUtils.validateEvent(event);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should validate a correctly formatted session authentication event", () => {
      const event = EventTrackingUtils.createSessionAuthenticationEvent({
        dAppId: "test-dapp",
        sessionId: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        unsignedTransactionHash: "0x02f90552017a8427e021408427e021408304c04c",
        chainId: "1",
        transactionHash:
          "0xcaf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      });

      const result = EventTrackingUtils.validateEvent(event);
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should return detailed errors for an invalid event", () => {
      const event = EventTrackingUtils.createInvoicingTransactionSignedEvent({
        dAppId: "test-dapp",
        sessionId: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        transactionHash:
          "0xcaf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
        recipientAddress: "0x111111125421cA6dc452d289314280a0f8842A65",
        chainId: "1",
        unsignedTransactionHash: "0x02f90552017a8427e021408427e021408304c04c",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event.data as any).event_id = "not-a-valid-uuid";

      const result = EventTrackingUtils.validateEvent(event);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
      expect(result.errors?.[0].path).toBe("event_id");
    });
  });

  describe("normalizeTransactionHash", () => {
    it("should normalize transaction hashes by removing 0x prefix", () => {
      const event = EventTrackingUtils.createInvoicingTransactionSignedEvent({
        dAppId: "test-dapp",
        sessionId: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        transactionHash:
          "0xCAF172BF3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
        recipientAddress: "0x111111125421cA6dc452d289314280a0f8842A65",
        chainId: "1",
        unsignedTransactionHash: "0x02f90552017a8427e021408427e021408304c04c",
      });

      const data = event.data as InvoicingTransactionSignedEventData;
      expect(data.transaction_hash).toBe(
        "caf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      );
      expect(data.unsigned_transaction_hash).toBe(
        "02f90552017a8427e021408427e021408304c04c",
      );
    });

    it("should normalize recipient address to lowercase", () => {
      const event = EventTrackingUtils.createInvoicingTransactionSignedEvent({
        dAppId: "test-dapp",
        sessionId: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        transactionHash:
          "0xcaf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
        recipientAddress: "0X111111125421CA6DC452D289314280A0F8842A65",
        unsignedTransactionHash: "0x02f90552017a8427e021408427e021408304c04c",
        chainId: "1",
      });

      const data = event.data as InvoicingTransactionSignedEventData;
      expect(data.recipient_address).toBe(
        "0x111111125421ca6dc452d289314280a0f8842a65",
      );
    });

    it("should normalize unsigned transaction hashes", () => {
      const event = EventTrackingUtils.createTransactionFlowCompletionEvent({
        dAppId: "test-dapp",
        sessionId: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        chainId: "1",
        unsignedTransactionHash: "0X02F90552017A8427E021408427E021408304C04C",
        transactionHash:
          "0XCAF172BF3784A1EA3DBB2C551DE9E2B263C9C4F762589363776CDA325B6DE11C",
      });

      const data = event.data as TransactionFlowCompletionEventData;
      expect(data.unsigned_transaction_hash).toBe(
        "02f90552017a8427e021408427e021408304c04c",
      );
      expect(data.transaction_hash).toBe(
        "caf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      );
    });
  });
});
