import { describe, expect, it } from "vitest";

import { LedgerButtonError } from "../../../api/errors/LedgerButtonError.js";
import {
  AccountNotSelectedError,
  DeviceConnectionError,
  FailToOpenAppError,
  SignTransactionError,
} from "./errors.js";
describe.each([
  [
    DeviceConnectionError,
    "DeviceConnectionError",
    "Device connection failed",
    { type: "failed-to-connect" as const },
  ],
  [
    SignTransactionError,
    "SignTransactionError",
    "Transaction signing failed",
    { transactionId: "tx-123" },
  ],
  [
    AccountNotSelectedError,
    "AccountNotSelectedError",
    "No account selected",
    { requiredAction: "select-account" },
  ],
  [
    FailToOpenAppError,
    "FailToOpenAppError",
    "Failed to open app",
    { appName: "Ethereum" },
  ],
])("%s with context", (ErrorClass, expectedName, message, context) => {
  it("should create error with message and context", () => {
    // @ts-expect-error: test each expects alignment with error constructor signatures
    const error = new ErrorClass(message, context);

    expect(error).toBeInstanceOf(LedgerButtonError);
    expect(error.name).toBe(expectedName);
    expect(error.message).toBe(message);
    expect(error.context).toEqual(context);
  });
});
