import { DeviceModelId } from "@ledgerhq/device-management-kit";
import { describe, expect, it } from "vitest";

import {
  createMockConnectedDevice,
  mockConnectedDevice,
} from "../__tests__/mocks.js";
import { Device } from "./Device.js";

describe("Device", () => {
  describe("getters", () => {
    it("should return the connected device", () => {
      const device = new Device(createMockConnectedDevice());

      expect(device).toMatchObject({
        name: mockConnectedDevice.name,
        modelId: mockConnectedDevice.modelId,
        sessionId: mockConnectedDevice.sessionId,
        type: mockConnectedDevice.type,
      });
    });
  });

  describe("iconType", () => {
    it.each([
      { name: "Nano X", modelId: DeviceModelId.NANO_X, expected: "nanox" },
      { name: "Nano S", modelId: DeviceModelId.NANO_S, expected: "nanox" },
      { name: "Nano SP", modelId: DeviceModelId.NANO_SP, expected: "nanox" },
      { name: "Stax", modelId: DeviceModelId.STAX, expected: "stax" },
      { name: "Flex", modelId: DeviceModelId.FLEX, expected: "flex" },
      { name: "Apex", modelId: DeviceModelId.APEX, expected: "apexp" },
    ])(
      "should return '$expected' for $name device",
      ({ name, modelId, expected }) => {
        const device = new Device(createMockConnectedDevice({ name, modelId }));

        expect(device.iconType).toBe(expected);
      },
    );
  });
});
