import { describe, expect, it } from "vitest";

import { LedgerButtonError } from "../../../api/errors/LedgerButtonError.js";
import {
  AlpacaApiError,
  AlpacaBalanceFetchError,
  AlpacaInvalidAddressError,
  AlpacaNetworkError,
  AlpacaServiceErrors,
  AlpacaTokenFetchError,
  AlpacaUnknownError,
  AlpacaUnsupportedChainError,
} from "./error.js";

describe("Alpaca Service Errors", () => {
  const testAddress = "0x1234567890abcdef1234567890abcdef12345678";
  const testAddressAlt = "0xabc";
  const testAddressInvalid = "0xinvalid";
  const testCurrencyIdEth = "ethereum";
  const testCurrencyIdPolygon = "polygon";

  describe("AlpacaNetworkError", () => {
    it("should create error with message", () => {
      const error = new AlpacaNetworkError("Connection failed");

      expect(error).toBeInstanceOf(LedgerButtonError);
      expect(error.name).toBe("AlpacaNetworkError");
      expect(error.message).toBe("Connection failed");
      expect(error.context).toBeUndefined();
    });

    it("should create error with message and context", () => {
      const context = { statusCode: 500, url: "https://api.example.com" };
      const error = new AlpacaNetworkError("Connection failed", context);

      expect(error.context).toEqual(context);
    });
  });

  describe("AlpacaInvalidAddressError", () => {
    it("should create error with address in message", () => {
      const error = new AlpacaInvalidAddressError(testAddressInvalid);

      expect(error).toBeInstanceOf(LedgerButtonError);
      expect(error.name).toBe("AlpacaInvalidAddressError");
      expect(error.message).toBe(
        `Invalid address format: ${testAddressInvalid}`,
      );
      expect(error.context).toEqual({ address: testAddressInvalid });
    });

    it("should create error with additional context", () => {
      const additionalContext = { reason: "checksum failed" };
      const error = new AlpacaInvalidAddressError(
        testAddressInvalid,
        additionalContext,
      );

      expect(error.context).toEqual({
        address: testAddressInvalid,
        ...additionalContext,
      });
    });
  });

  describe("AlpacaUnsupportedChainError", () => {
    it("should create error with currencyId in message", () => {
      const currencyId = "unsupported-chain";
      const error = new AlpacaUnsupportedChainError(currencyId);

      expect(error).toBeInstanceOf(LedgerButtonError);
      expect(error.name).toBe("AlpacaUnsupportedChainError");
      expect(error.message).toBe(`Unsupported chain: ${currencyId}`);
      expect(error.context).toEqual({ currencyId });
    });

    it("should create error with additional context", () => {
      const currencyId = "unknown-network";
      const additionalContext = { supportedChains: ["ethereum", "polygon"] };
      const error = new AlpacaUnsupportedChainError(
        currencyId,
        additionalContext,
      );

      expect(error.context).toEqual({ currencyId, ...additionalContext });
    });
  });

  describe("AlpacaApiError", () => {
    it("should create error with message", () => {
      const error = new AlpacaApiError("API request failed");

      expect(error).toBeInstanceOf(LedgerButtonError);
      expect(error.name).toBe("AlpacaApiError");
      expect(error.message).toBe("API request failed");
      expect(error.context).toBeUndefined();
    });

    it("should create error with message and context", () => {
      const context = { endpoint: "/balance", method: "GET" };
      const error = new AlpacaApiError("API request failed", context);

      expect(error.context).toEqual(context);
    });
  });

  describe("AlpacaBalanceFetchError", () => {
    it("should create error with address and currencyId in message", () => {
      const error = new AlpacaBalanceFetchError(testAddress, testCurrencyIdEth);

      expect(error).toBeInstanceOf(LedgerButtonError);
      expect(error.name).toBe("AlpacaBalanceFetchError");
      expect(error.message).toBe(
        `Failed to fetch balance for address ${testAddress} on ${testCurrencyIdEth}`,
      );
      expect(error.context).toEqual({
        address: testAddress,
        currencyId: testCurrencyIdEth,
      });
    });

    it("should create error with additional context", () => {
      const additionalContext = { retryCount: 3, lastError: "timeout" };
      const error = new AlpacaBalanceFetchError(
        testAddressAlt,
        testCurrencyIdPolygon,
        additionalContext,
      );

      expect(error.context).toEqual({
        address: testAddressAlt,
        currencyId: testCurrencyIdPolygon,
        ...additionalContext,
      });
    });
  });

  describe("AlpacaTokenFetchError", () => {
    it("should create error with address and currencyId in message", () => {
      const error = new AlpacaTokenFetchError(testAddress, testCurrencyIdEth);

      expect(error).toBeInstanceOf(LedgerButtonError);
      expect(error.name).toBe("AlpacaTokenFetchError");
      expect(error.message).toBe(
        `Failed to fetch token balances for address ${testAddress} on ${testCurrencyIdEth}`,
      );
      expect(error.context).toEqual({
        address: testAddress,
        currencyId: testCurrencyIdEth,
      });
    });

    it("should create error with additional context", () => {
      const currencyId = "arbitrum";
      const additionalContext = { tokenCount: 5, failedTokens: ["USDT"] };
      const error = new AlpacaTokenFetchError(
        testAddressAlt,
        currencyId,
        additionalContext,
      );

      expect(error.context).toEqual({
        address: testAddressAlt,
        currencyId,
        ...additionalContext,
      });
    });
  });

  describe("AlpacaUnknownError", () => {
    it("should create error with message", () => {
      const error = new AlpacaUnknownError("Something went wrong");

      expect(error).toBeInstanceOf(LedgerButtonError);
      expect(error.name).toBe("AlpacaUnknownError");
      expect(error.message).toBe("Something went wrong");
      expect(error.context).toBeUndefined();
    });

    it("should create error with message and context", () => {
      const context = { details: "Unexpected state", code: "UNKNOWN" };
      const error = new AlpacaUnknownError("Something went wrong", context);

      expect(error.context).toEqual(context);
    });
  });

  describe("AlpacaServiceErrors", () => {
    test.each([
      [
        "networkError",
        AlpacaServiceErrors.networkError,
        AlpacaNetworkError,
        "Network timeout",
      ],
      [
        "invalidAddress",
        AlpacaServiceErrors.invalidAddress,
        AlpacaInvalidAddressError,
        "0x123",
      ],
      [
        "unsupportedChain",
        AlpacaServiceErrors.unsupportedChain,
        AlpacaUnsupportedChainError,
        "solana",
      ],
      [
        "apiError",
        AlpacaServiceErrors.apiError,
        AlpacaApiError,
        "API request failed",
      ],
      [
        "balanceFetchError",
        AlpacaServiceErrors.balanceFetchError,
        AlpacaBalanceFetchError,
        "0x123",
        "eth",
      ],
      [
        "tokenFetchError",
        AlpacaServiceErrors.tokenFetchError,
        AlpacaTokenFetchError,
        "0x123",
        "eth",
      ],
      [
        "unknownError",
        AlpacaServiceErrors.unknownError,
        AlpacaUnknownError,
        "Something went wrong",
      ],
    ])("%s", (_, factory, InstanceType, ...params: unknown[]) => {
      // @ts-expect-error: test each expects alignment with error constructor signatures
      expect(factory(...params)).toBeInstanceOf(InstanceType);
    });
  });
});
