import { describe, expect, it } from "vitest";

import {
  InvoicingTransactionSignedEventSchema,
  SessionAuthenticationEventSchema,
  TransactionFlowCompletionEventSchema,
} from "./event-schemas.js";

describe("Event Schema Validation", () => {
  describe("InvoicingTransactionSignedEventSchema", () => {
    it("should validate a correct invoicing event", () => {
      const validEvent = {
        event_id: "bf75cd86-c565-49e1-97ec-e16b6071be11",
        transaction_dapp_id: "1inch",
        timestamp_ms: 1759918630007,
        event_type: "invoicing_transaction_signed",
        blockchain_network_selected: "ethereum",
        transaction_hash:
          "caf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
        recipient_address: "0x111111125421ca6dc452d289314280a0f8842a65",
        unsigned_transaction_hash: "02f90552017a8427e021408427e021408304c04c",
      };

      const result =
        InvoicingTransactionSignedEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("should reject transaction_hash with 0x prefix", () => {
      const invalidEvent = {
        event_id: "bf75cd86-c565-49e1-97ec-e16b6071be11",
        transaction_dapp_id: "1inch",
        timestamp_ms: 1759918630007,
        event_type: "invoicing_transaction_signed",
        blockchain_network_selected: "ethereum",
        transaction_hash:
          "0xcaf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
        source_token: "0x111111125421cA6dc452d289314280a0f8842A65",
        target_token: "0x111111125421cA6dc452d289314280a0f8842A65",
        recipient_address: "0x111111125421ca6dc452d289314280a0f8842a65",
        transaction_amount: "0",
        transaction_id:
          "0xcaf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      };

      const result =
        InvoicingTransactionSignedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes("transaction_hash"),
          ),
        ).toBe(true);
      }
    });

    it("should reject invalid event_id format", () => {
      const invalidEvent = {
        event_id: "not-a-uuid",
        transaction_dapp_id: "1inch",
        timestamp_ms: 1759918630007,
        event_type: "invoicing_transaction_signed",
        blockchain_network_selected: "ethereum",
        transaction_hash:
          "caf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
        source_token: "0x111111125421cA6dc452d289314280a0f8842A65",
        target_token: "0x111111125421cA6dc452d289314280a0f8842A65",
        recipient_address: "0x111111125421ca6dc452d289314280a0f8842a65",
        transaction_amount: "0",
        transaction_id:
          "caf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      };

      const result =
        InvoicingTransactionSignedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe("TransactionFlowCompletionEventSchema", () => {
    it("should validate a correct transaction flow completion event", () => {
      const validEvent = {
        event_id: "5301b8e6-4e06-4ce0-83a0-15ef70f6c514",
        transaction_dapp_id: "1inch",
        timestamp_ms: 1759918628839,
        event_type: "transaction_flow_completion",
        session_id: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        blockchain_network_selected: "ethereum",
        account_currency: "bsc",
        account_balance: "0",
        unsigned_transaction_hash:
          "02f90552017a8427e021408427e021408304c04c94111111125421ca6dc452d289314280a0f8842a6580b905285816d7230000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000006535d5f76f021fe65e2ac73d086df4b4bd7ee5d9000000000000000000000000111111125421ca6dc452d289314280a0f8842a65ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000068d7b0ff000000000000000000000000000000000000000000000000000000000000001b2955cafcf376ad72c16aae0ae03133d47c376c56e0e320ff0b55882b534be0b0488abb3a0df87ce30e0d3f000514bb1554dcdda1718e430a8517f0326c5f7138000000000000000000000000000000000000000000000000000000000000000000000000000000000000038456a75868ec52913d0685e272322693006a4a34dd16c9d69633e25beb349bb0b7f2736abc00000000000000000000000051c72848c68a965f66fa7a88855f9f7784502a7f00000000000000000000000051c72848c68a965f66fa7a88855f9f7784502a7f0000000000000000000000008b543dff08ed4ba13ee96f533638ef54591aee71000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000f3d3700000000000000000000000000000000000000000000000000000000000f424002000000000000000000000000c39a89c00068d65fdcc73d086df4b4bd7ee5d9000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000f4240200001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000041cb2ccb4acde353a7a6b9bd6b796e26f4e54403ac1bff58c54e405e8e198877b11fc13a55bdc175349f71ac5f6f9ad5d817e6647ecd8a39429770df47a505a52a1b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001600000014000000140000001400000014000000140000001400000014000000140000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec700000000000000000000000000000000000000000000000000000000000f3d3700000000000000000000000000000000000000000000000000000000c39a89c00000000000000000000000000000000000000000000000000000000068d65fdc5cfba74cd4040da188b38de014b161bb25aa6638d9afbe5344b1e93988d28e4700000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000041a786f1cce13043b1a2d1f2b472617400413ee34dc08e92ee87d6c1616f0b9cc61a93b37da1ac56d6c6d83552f1e247c157507f368e57f594b5859059e579875a1b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e26b9977c0",
        transaction_type: "standard_tx",
        transaction_hash:
          "caf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      };

      const result = TransactionFlowCompletionEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("should reject unsigned_transaction_hash with 0x prefix", () => {
      const invalidEvent = {
        event_id: "5301b8e6-4e06-4ce0-83a0-15ef70f6c514",
        transaction_dapp_id: "1inch",
        timestamp_ms: 1759918628839,
        event_type: "transaction_flow_completion",
        session_id: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        blockchain_network_selected: "ethereum",
        account_currency: "bsc",
        account_balance: "0",
        unsigned_transaction_hash: "0x02f90552017a8427e021408427e021408304c04c",
        transaction_type: "standard_tx",
        transaction_hash:
          "caf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      };

      const result =
        TransactionFlowCompletionEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes("unsigned_transaction_hash"),
          ),
        ).toBe(true);
      }
    });
  });

  describe("SessionAuthenticationEventSchema", () => {
    it("should validate a correct session authentication event", () => {
      const validEvent = {
        event_id: "5301b8e6-4e06-4ce0-83a0-15ef70f6c514",
        transaction_dapp_id: "1inch",
        timestamp_ms: 1759918628839,
        event_type: "session_authentication",
        session_id: "a93f987c-11df-40d7-abe7-cfd2c7be92a2",
        blockchain_network_selected: "ethereum",
        unsigned_transaction_hash: "02f90552017a8427e021408427e021408304c04c",
        transaction_type: "authentication_tx",
        transaction_hash:
          "caf172bf3784a1ea3dbb2c551de9e2b263c9c4f762589363776cda325b6de11c",
      };

      const result = SessionAuthenticationEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });
  });
});
