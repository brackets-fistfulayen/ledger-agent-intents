import {
  ConnectedDevice,
  DeviceManagementKit,
  DeviceModelId,
  DiscoveredDevice,
} from "@ledgerhq/device-management-kit";
import { vi } from "vitest";

import { Device } from "../model/Device.js";
import type { DeviceManagementKitService } from "../service/DeviceManagementKitService.js";

export function createMockDeviceManagementKit(): DeviceManagementKit {
  return {
    startDiscovering: vi.fn(),
    stopDiscovering: vi.fn(),
    connect: vi.fn(),
    getConnectedDevice: vi.fn(),
    close: vi.fn(),
    listenToAvailableDevices: vi.fn(),
  } as unknown as DeviceManagementKit;
}

export function createMockDeviceManagementKitService(): {
  connectToDevice: ReturnType<typeof vi.fn>;
  disconnectFromDevice: ReturnType<typeof vi.fn>;
  listAvailableDevices: ReturnType<typeof vi.fn>;
  dmk: unknown;
  sessionId?: string;
  connectedDevice?: Device;
} {
  return {
    connectToDevice: vi.fn(),
    disconnectFromDevice: vi.fn(),
    listAvailableDevices: vi.fn(),
    dmk: {},
  };
}

export function createMockLogger() {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    fatal: vi.fn(),
    subscribers: [],
  };
}

export function createMockLoggerFactory() {
  return vi.fn().mockReturnValue(createMockLogger());
}

export const mockUsbDevice = new Device({
  name: "Nano X",
  modelId: DeviceModelId.NANO_X,
  sessionId: "session-123",
  type: "USB",
  id: "device-1",
} as ConnectedDevice);

export const mockBleDevice = new Device({
  name: "Flex",
  modelId: DeviceModelId.FLEX,
  sessionId: "session-456",
  type: "BLE",
  id: "device-2",
} as ConnectedDevice);

export const mockNanoSDevice = new Device({
  name: "Nano S",
  modelId: DeviceModelId.NANO_S,
  sessionId: "session-789",
  type: "USB",
  id: "device-3",
} as ConnectedDevice);

export const mockDiscoveredDevice: DiscoveredDevice = {
  id: "device-1",
  name: "Test Device",
  deviceModel: {
    id: "nano-x-001",
    model: DeviceModelId.NANO_X,
    name: "Nano X",
  },
  transport: "USB",
};

export const mockConnectedDevice: ConnectedDevice = {
  id: "device-1",
  name: "Test Device",
  modelId: DeviceModelId.FLEX,
  sessionId: "session-123",
  type: "USB",
} as ConnectedDevice;

export function createMockConnectedDevice(
  overrides: Partial<ConnectedDevice> = {},
): ConnectedDevice {
  return {
    id: "device-1",
    name: "Test Device",
    modelId: DeviceModelId.FLEX,
    sessionId: "session-123",
    type: "USB",
    ...overrides,
  } as ConnectedDevice;
}

export const mockDiscoveredDevices: DiscoveredDevice[] = [
  {
    id: "device-1",
    name: "Nano X",
    deviceModel: {
      id: "nano-x-001",
      model: DeviceModelId.NANO_X,
      name: "Nano X",
    },
    transport: "USB",
  },
  {
    id: "device-2",
    name: "Flex",
    deviceModel: {
      id: "flex-001",
      model: DeviceModelId.FLEX,
      name: "Flex",
    },
    transport: "BLE",
  },
];

export function asMockService(
  mock: ReturnType<typeof createMockDeviceManagementKitService>,
): DeviceManagementKitService {
  return mock as unknown as DeviceManagementKitService;
}
