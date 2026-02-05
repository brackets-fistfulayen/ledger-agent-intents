import { describe, expect, it } from "vitest";

import { isSignTypedMessageParams } from "./SignTypedMessageParams.js";

describe("isSignTypedMessageParams", () => {
  const validTypedData = {
    types: {
      EIP712Domain: [{ name: "name", type: "string" }],
      Person: [{ name: "name", type: "string" }],
    },
    primaryType: "Person",
    domain: { name: "Test" },
    message: { name: "John" },
  };

  describe("valid params", () => {
    it.each([
      ["eth_signTypedData", "eth_signTypedData"],
      ["eth_signTypedData_v4", "eth_signTypedData_v4"],
    ])("should return true for valid params with method %s", (method) => {
      const params = ["0x1234", validTypedData, method];
      expect(isSignTypedMessageParams(params)).toBe(true);
    });
  });

  describe("invalid params", () => {
    it("should return false for null", () => {
      expect(isSignTypedMessageParams(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isSignTypedMessageParams(undefined)).toBe(false);
    });

    it("should return false for non-array", () => {
      expect(isSignTypedMessageParams({ foo: "bar" })).toBe(false);
    });

    it("should return false for empty array", () => {
      expect(isSignTypedMessageParams([])).toBe(false);
    });

    it("should return false for wrong array length", () => {
      expect(isSignTypedMessageParams(["0x1234", validTypedData])).toBe(false);
      expect(
        isSignTypedMessageParams([
          "0x1234",
          validTypedData,
          "eth_signTypedData",
          "extra",
        ]),
      ).toBe(false);
    });

    it("should return false when first element is not a string", () => {
      expect(
        isSignTypedMessageParams([123, validTypedData, "eth_signTypedData"]),
      ).toBe(false);
    });

    it("should return false when second element is not an object", () => {
      expect(
        isSignTypedMessageParams([
          "0x1234",
          "not-an-object",
          "eth_signTypedData",
        ]),
      ).toBe(false);
    });

    it("should return false when typed data is missing required fields", () => {
      const missingTypes = { primaryType: "Person", domain: {}, message: {} };
      const missingPrimaryType = { types: {}, domain: {}, message: {} };
      const missingDomain = { types: {}, primaryType: "Person", message: {} };
      const missingMessage = { types: {}, primaryType: "Person", domain: {} };

      expect(
        isSignTypedMessageParams(["0x1234", missingTypes, "eth_signTypedData"]),
      ).toBe(false);
      expect(
        isSignTypedMessageParams([
          "0x1234",
          missingPrimaryType,
          "eth_signTypedData",
        ]),
      ).toBe(false);
      expect(
        isSignTypedMessageParams([
          "0x1234",
          missingDomain,
          "eth_signTypedData",
        ]),
      ).toBe(false);
      expect(
        isSignTypedMessageParams([
          "0x1234",
          missingMessage,
          "eth_signTypedData",
        ]),
      ).toBe(false);
    });

    it("should return false when method is not a string", () => {
      expect(isSignTypedMessageParams(["0x1234", validTypedData, 123])).toBe(
        false,
      );
    });

    it("should return false for unsupported methods", () => {
      expect(
        isSignTypedMessageParams(["0x1234", validTypedData, "personal_sign"]),
      ).toBe(false);
      expect(
        isSignTypedMessageParams(["0x1234", validTypedData, "eth_sign"]),
      ).toBe(false);
      expect(
        isSignTypedMessageParams(["0x1234", validTypedData, "unknown_method"]),
      ).toBe(false);
    });
  });
});
