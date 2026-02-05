import { DeviceModelId } from "@ledgerhq/device-management-kit";

import {
  BlindSigningDisabledError,
  DeviceDisconnectedError,
  DeviceNotSupportedError,
  IncorrectSeedError,
  UserRejectedTransactionError,
} from "./DeviceErrors.js";
import { LedgerButtonError } from "./LedgerButtonError.js";

describe("DeviceErrors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DeviceNotSupportedError", () => {
    it("should be able to create a new error with modelId context", () => {
      const modelId = DeviceModelId.NANO_S;
      const error = new DeviceNotSupportedError("Device not supported", {
        modelId,
      });

      expect(error).toBeDefined();
      expect(error.name).toBe("DeviceNotSupportedError");
      expect(error.message).toBe("Device not supported");
      expect(error.context).toMatchObject({ modelId });
      expect(error.context?.modelId).toBe(modelId);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should handle different device model IDs", () => {
      const nanoXError = new DeviceNotSupportedError("Not supported", {
        modelId: DeviceModelId.NANO_X,
      });
      const nanoSPlusError = new DeviceNotSupportedError("Not supported", {
        modelId: DeviceModelId.NANO_SP,
      });

      expect(nanoXError.context?.modelId).toBe(DeviceModelId.NANO_X);
      expect(nanoSPlusError.context?.modelId).toBe(DeviceModelId.NANO_SP);
    });

    it("should be able to serialize the error", () => {
      const modelId = DeviceModelId.STAX;
      const error = new DeviceNotSupportedError("test", { modelId });
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "DeviceNotSupportedError",
        message: "test",
        context: { modelId },
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });

  describe("DeviceDisconnectedError", () => {
    it("should be able to create a new error without context", () => {
      const error = new DeviceDisconnectedError("Device disconnected");

      expect(error).toBeDefined();
      expect(error.name).toBe("DeviceDisconnectedError");
      expect(error.message).toBe("Device disconnected");
      expect(error.context).toBeUndefined();
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should be able to create error with deviceModel context", () => {
      const error = new DeviceDisconnectedError("Device disconnected", {
        deviceModel: "Nano X",
      });

      expect(error).toBeDefined();
      expect(error.context).toMatchObject({ deviceModel: "Nano X" });
      expect(error.context?.deviceModel).toBe("Nano X");
    });

    it("should be able to create error with connectionType context", () => {
      const error = new DeviceDisconnectedError("Device disconnected", {
        connectionType: "bluetooth",
      });

      expect(error).toBeDefined();
      expect(error.context).toMatchObject({ connectionType: "bluetooth" });
      expect(error.context?.connectionType).toBe("bluetooth");
    });

    it("should be able to create error with both deviceModel and connectionType", () => {
      const error = new DeviceDisconnectedError("Device disconnected", {
        deviceModel: "Nano S Plus",
        connectionType: "usb",
      });

      expect(error).toBeDefined();
      expect(error.context).toMatchObject({
        deviceModel: "Nano S Plus",
        connectionType: "usb",
      });
    });

    it("should handle both bluetooth and usb connection types", () => {
      const bluetoothError = new DeviceDisconnectedError("Disconnected", {
        connectionType: "bluetooth",
      });
      const usbError = new DeviceDisconnectedError("Disconnected", {
        connectionType: "usb",
      });

      expect(bluetoothError.context?.connectionType).toBe("bluetooth");
      expect(usbError.context?.connectionType).toBe("usb");
    });

    it("should be able to serialize the error", () => {
      const error = new DeviceDisconnectedError("test", {
        deviceModel: "Stax",
        connectionType: "bluetooth",
      });
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "DeviceDisconnectedError",
        message: "test",
        context: { deviceModel: "Stax", connectionType: "bluetooth" },
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });

  describe("IncorrectSeedError", () => {
    it("should be able to create a new error without context", () => {
      const error = new IncorrectSeedError("Incorrect seed phrase");

      expect(error).toBeDefined();
      expect(error.name).toBe("IncorrectSeedError");
      expect(error.message).toBe("Incorrect seed phrase");
      expect(error.context).toBeUndefined();
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should be able to create error with context", () => {
      const context = { expectedAddress: "0x123", actualAddress: "0x456" };
      const error = new IncorrectSeedError("Seed mismatch", context);

      expect(error).toBeDefined();
      expect(error.context).toMatchObject(context);
    });

    it("should be able to serialize the error", () => {
      const error = new IncorrectSeedError("test", { reason: "mismatch" });
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "IncorrectSeedError",
        message: "test",
        context: { reason: "mismatch" },
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });

  describe("BlindSigningDisabledError", () => {
    it("should be able to create a new error without context", () => {
      const error = new BlindSigningDisabledError("Blind signing is disabled");

      expect(error).toBeDefined();
      expect(error.name).toBe("BlindSigningDisabledError");
      expect(error.message).toBe("Blind signing is disabled");
      expect(error.context).toBeUndefined();
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should be able to create error with context", () => {
      const context = { contract: "0xabc", network: "ethereum" };
      const error = new BlindSigningDisabledError(
        "Blind signing required",
        context,
      );

      expect(error).toBeDefined();
      expect(error.context).toMatchObject(context);
    });

    it("should be able to serialize the error", () => {
      const error = new BlindSigningDisabledError("test", {
        action: "sign",
      });
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "BlindSigningDisabledError",
        message: "test",
        context: { action: "sign" },
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });

  describe("UserRejectedTransactionError", () => {
    it("should be able to create a new error without context", () => {
      const error = new UserRejectedTransactionError(
        "User rejected the transaction",
      );

      expect(error).toBeDefined();
      expect(error.name).toBe("UserRejectedTransactionError");
      expect(error.message).toBe("User rejected the transaction");
      expect(error.context).toBeUndefined();
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should be able to create error with context", () => {
      const context = { transactionId: "tx-123", reason: "user_cancel" };
      const error = new UserRejectedTransactionError(
        "Transaction rejected",
        context,
      );

      expect(error).toBeDefined();
      expect(error.context).toMatchObject(context);
    });

    it("should be able to serialize the error", () => {
      const error = new UserRejectedTransactionError("test", {
        stage: "confirmation",
      });
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "UserRejectedTransactionError",
        message: "test",
        context: { stage: "confirmation" },
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });
});
