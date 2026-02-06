import { DeviceManagementKit, DiscoveredDevice } from '@ledgerhq/device-management-kit';
import { Device } from '../model/Device.js';
export type ConnectionType = "bluetooth" | "usb" | "";
export interface DeviceManagementKitService {
    dmk: DeviceManagementKit;
    sessionId?: string;
    connectedDevice?: Device;
    connectToDevice: ({ type }: {
        type: ConnectionType;
    }) => Promise<Device>;
    disconnectFromDevice: () => Promise<void>;
    listAvailableDevices: () => Promise<DiscoveredDevice[]>;
}
//# sourceMappingURL=DeviceManagementKitService.d.ts.map