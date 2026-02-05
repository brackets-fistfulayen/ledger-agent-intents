import { ConnectedDevice, DeviceManagementKit, DiscoveredDevice } from '@ledgerhq/device-management-kit';
import { vi } from 'vitest';
import { Device } from '../model/Device.js';
import { DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare function createMockDeviceManagementKit(): DeviceManagementKit;
export declare function createMockDeviceManagementKitService(): {
    connectToDevice: ReturnType<typeof vi.fn>;
    disconnectFromDevice: ReturnType<typeof vi.fn>;
    listAvailableDevices: ReturnType<typeof vi.fn>;
    dmk: unknown;
    sessionId?: string;
    connectedDevice?: Device;
};
export declare function createMockLogger(): {
    log: any;
    error: any;
    warn: any;
    debug: any;
    info: any;
    fatal: any;
    subscribers: any[];
};
export declare function createMockLoggerFactory(): any;
export declare const mockUsbDevice: Device;
export declare const mockBleDevice: Device;
export declare const mockNanoSDevice: Device;
export declare const mockDiscoveredDevice: DiscoveredDevice;
export declare const mockConnectedDevice: ConnectedDevice;
export declare function createMockConnectedDevice(overrides?: Partial<ConnectedDevice>): ConnectedDevice;
export declare const mockDiscoveredDevices: DiscoveredDevice[];
export declare function asMockService(mock: ReturnType<typeof createMockDeviceManagementKitService>): DeviceManagementKitService;
//# sourceMappingURL=mocks.d.ts.map