import { DeviceModelId } from "@ledgerhq/device-management-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DeviceNotSupportedError } from "../../../api/errors/DeviceErrors.js";
import {
  asMockService,
  createMockDeviceManagementKitService,
  createMockLoggerFactory,
  mockNanoSDevice,
  mockUsbDevice,
} from "../__tests__/mocks.js";
import { ConnectDevice } from "./ConnectDevice.js";

describe("ConnectDevice", () => {
  let connectDevice: ConnectDevice;
  let mockDeviceManagementKitService: ReturnType<
    typeof createMockDeviceManagementKitService
  >;

  beforeEach(() => {
    mockDeviceManagementKitService = createMockDeviceManagementKitService();

    connectDevice = new ConnectDevice(
      createMockLoggerFactory(),
      asMockService(mockDeviceManagementKitService),
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    describe("successful device connection", () => {
      it("should connect to USB device successfully", async () => {
        const type = "usb" as const;
        mockDeviceManagementKitService.connectToDevice.mockResolvedValue(
          mockUsbDevice,
        );

        const result = await connectDevice.execute({ type });

        expect(result).toBe(mockUsbDevice);
        expect(
          mockDeviceManagementKitService.connectToDevice,
        ).toHaveBeenCalledWith({ type });
      });
    });

    describe("NANO_S device rejection", () => {
      beforeEach(() => {
        mockDeviceManagementKitService.connectToDevice.mockResolvedValue(
          mockNanoSDevice,
        );
        mockDeviceManagementKitService.disconnectFromDevice.mockResolvedValue(
          undefined,
        );
      });

      it("should throw DeviceNotSupportedError for NANO_S device", async () => {
        try {
          await connectDevice.execute({ type: "usb" });
        } catch (error) {
          expect(error).toBeInstanceOf(DeviceNotSupportedError);
          expect((error as DeviceNotSupportedError).context?.modelId).toBe(
            DeviceModelId.NANO_S,
          );
        }
      });
    });
  });
});
