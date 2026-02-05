import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  asMockService,
  createMockDeviceManagementKitService,
  createMockLoggerFactory,
} from "../__tests__/mocks.js";
import { SwitchDevice } from "./SwitchDevice.js";

describe("SwitchDevice", () => {
  let switchDevice: SwitchDevice;
  let mockDeviceManagementKitService: ReturnType<
    typeof createMockDeviceManagementKitService
  >;

  beforeEach(() => {
    mockDeviceManagementKitService = createMockDeviceManagementKitService();

    switchDevice = new SwitchDevice(
      createMockLoggerFactory(),
      asMockService(mockDeviceManagementKitService),
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    describe("successful device switching", () => {
      beforeEach(() => {
        mockDeviceManagementKitService.disconnectFromDevice.mockResolvedValue(
          undefined,
        );
        mockDeviceManagementKitService.connectToDevice.mockResolvedValue(
          undefined,
        );
      });

      it("should switch to device successfully", async () => {
        await switchDevice.execute({ type: "usb" });

        expect(
          mockDeviceManagementKitService.disconnectFromDevice,
        ).toHaveBeenCalledTimes(1);
        expect(
          mockDeviceManagementKitService.connectToDevice,
        ).toHaveBeenCalledWith({ type: "usb" });
      });
    });

    describe("error handling", () => {
      it("should throw error if connect fails after successful disconnect", async () => {
        const connectError = new Error("Failed to connect");
        mockDeviceManagementKitService.disconnectFromDevice.mockResolvedValue(
          undefined,
        );
        mockDeviceManagementKitService.connectToDevice.mockRejectedValue(
          connectError,
        );

        await expect(
          switchDevice.execute({ type: "bluetooth" }),
        ).rejects.toThrow(connectError);

        expect(
          mockDeviceManagementKitService.disconnectFromDevice,
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
