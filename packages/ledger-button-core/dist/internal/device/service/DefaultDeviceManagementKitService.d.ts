import { DeviceManagementKit, DiscoveredDevice, TransportIdentifier } from '@ledgerhq/device-management-kit';
import { Factory } from 'inversify';
import { DeviceModuleOptions } from '../../diTypes.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { Device } from '../model/Device.js';
import { DeviceManagementKitService } from './DeviceManagementKitService.js';
export type ConnectionType = "bluetooth" | "usb" | "";
export declare class DefaultDeviceManagementKitService implements DeviceManagementKitService {
    private readonly logger;
    private readonly _dmk;
    hidIdentifier: TransportIdentifier;
    bleIdentifier: TransportIdentifier;
    private _currentSessionId?;
    private _connectedDevice?;
    constructor(loggerFactory: Factory<LoggerPublisher>, args: DeviceModuleOptions);
    get dmk(): DeviceManagementKit;
    get sessionId(): string;
    get connectedDevice(): Device;
    connectToDevice({ type }: {
        type: ConnectionType;
    }): Promise<Device>;
    listAvailableDevices(): Promise<DiscoveredDevice[]>;
    disconnectFromDevice(): Promise<void>;
}
//# sourceMappingURL=DefaultDeviceManagementKitService.d.ts.map