import type { Signature as DeviceSignature } from "@ledgerhq/device-signer-kit-ethereum";
import { ethers, Signature } from "ethers";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Transaction } from "../../../api/model/signing/SignTransactionParams.js";
import {
  createSignedTransaction,
  getHexaStringFromSignature,
  getRawTransactionFromEipTransaction,
} from "./TransactionHelper.js";

describe("TransactionHelper", () => {
  const validTx = ethers.Transaction.from({
    chainId: 1,
    to: "0x1234567890abcdef1234567890abcdef12345678",
    value: 0n,
    data: "0x",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSignedTransaction", () => {
    const mockRawTransaction = validTx.unsignedSerialized;
    const mockSignature: Signature = {
      r: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      s: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      v: 27,
      yParity: 0,
      networkV: null,
    } as Signature;

    it("should create a signed transaction with rawTransaction and signedRawTransaction", () => {
      const result = createSignedTransaction(mockRawTransaction, mockSignature);

      expect(result).toHaveProperty("rawTransaction", mockRawTransaction);
      expect(result).toHaveProperty("signedRawTransaction");
      expect(typeof result.signedRawTransaction).toBe("string");
      expect(result.signedRawTransaction).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it("should attach signature to produce a different serialized transaction", () => {
      const result = createSignedTransaction(mockRawTransaction, mockSignature);

      expect(result.signedRawTransaction).not.toBe(mockRawTransaction);
      expect(result.signedRawTransaction.length).toBeGreaterThan(0);
    });
  });

  describe("getRawTransactionFromEipTransaction", () => {
    const baseTransaction: Transaction = {
      chainId: Number(validTx.chainId),
      to: validTx.to ?? "",
      value: "0x0",
      data: validTx.data,
    };

    it("should convert an EIP transaction to raw transaction hex string", () => {
      const result = getRawTransactionFromEipTransaction(baseTransaction);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it.each([
      {
        description: "gas limit",
        transaction: { ...baseTransaction, gas: "0x5208" },
      },
      {
        description: "nonce",
        transaction: { ...baseTransaction, nonce: "0x1" },
      },
      {
        description: "hex nonce",
        transaction: { ...baseTransaction, nonce: "0xa" },
      },
      {
        description: "value",
        transaction: { ...baseTransaction, value: "0xde0b6b3a7640000" },
      },
      {
        description: "data",
        transaction: {
          ...baseTransaction,
          data: "0xa9059cbb0000000000000000000000001234567890abcdef1234567890abcdef12345678",
        },
      },
    ])("should handle transaction with $description", ({ transaction }) => {
      const result = getRawTransactionFromEipTransaction(transaction);

      expect(result).toBeDefined();
      expect(result).toMatch(/^0x[0-9a-fA-F]+$/);
    });

    it("should throw error for invalid transaction", () => {
      const invalidTx = {
        chainId: "invalid",
        to: "not-an-address",
        value: "invalid",
        data: "0x",
      } as unknown as Transaction;

      expect(() => {
        getRawTransactionFromEipTransaction(invalidTx);
      }).toThrow();
    });
  });

  describe("getHexaStringFromSignature", () => {
    it("should convert device signature to serialized hex string", () => {
      const deviceSignature: DeviceSignature = {
        r: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as `0x${string}`,
        s: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as `0x${string}`,
        v: 27,
      };

      const result = getHexaStringFromSignature(deviceSignature);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^0x[0-9a-fA-F]+$/);
    });
  });
});
