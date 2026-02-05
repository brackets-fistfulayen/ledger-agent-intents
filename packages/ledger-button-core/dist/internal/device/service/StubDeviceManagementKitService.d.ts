import { DeviceManagementKit, DeviceModelId } from '@ledgerhq/device-management-kit';
import { Device } from '../model/Device.js';
import { DeviceManagementKitService } from './DeviceManagementKitService.js';
export declare class StubDeviceManagementKitService implements DeviceManagementKitService {
    dmk: DeviceManagementKit;
    sessionId: string | undefined;
    connectedDevice: Device | undefined;
    connectToDevice: () => Promise<Device>;
    disconnectFromDevice: () => Promise<void>;
    listAvailableDevices: () => Promise<{
        id: string;
        name: string;
        deviceModel: {
            id: string;
            model: DeviceModelId;
            name: string;
        };
        transport: string;
    }[]>;
}
//# sourceMappingURL=StubDeviceManagementKitService.d.ts.map