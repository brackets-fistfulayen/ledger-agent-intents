import { DeviceModelId } from "@ledgerhq/device-management-kit";

import { LedgerButtonError } from "./LedgerButtonError.js";

export class DeviceNotSupportedError extends LedgerButtonError<{
  modelId: DeviceModelId;
}> {
  constructor(message: string, context: { modelId: DeviceModelId }) {
    super(message, "DeviceNotSupportedError", context);
  }
}

export class DeviceDisconnectedError extends LedgerButtonError<{
  deviceModel?: string;
  connectionType?: "bluetooth" | "usb";
}> {
  constructor(
    message: string,
    context?: { deviceModel?: string; connectionType?: "bluetooth" | "usb" },
  ) {
    super(message, "DeviceDisconnectedError", context);
  }
}

export class IncorrectSeedError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "IncorrectSeedError", context);
  }
}

export class BlindSigningDisabledError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "BlindSigningDisabledError", context);
  }
}

export class UserRejectedTransactionError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "UserRejectedTransactionError", context);
  }
}
