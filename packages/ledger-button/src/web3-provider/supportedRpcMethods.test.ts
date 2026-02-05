import { describe, expect, test } from "vitest";

import {
  isSupportedRpcMethod,
  SUPPORTED_RPC_METHODS,
} from "./supportedRpcMethods.js";

describe("supportedRpcMethods", () => {
  describe("isSupportedRpcMethod", () => {
    test.each([...SUPPORTED_RPC_METHODS])(
      "should return true for supported method: %s",
      (method) => {
        expect(isSupportedRpcMethod(method)).toBe(true);
      },
    );

    test.each(["eth_signTypedData_v3", "invalid_method", ""])(
      "should return false for unsupported method: %s",
      (method) => {
        expect(isSupportedRpcMethod(method)).toBe(false);
      },
    );
  });
});
