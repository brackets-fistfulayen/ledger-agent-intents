import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { Device } from '../model/Device.js';
import { ConnectionType, DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class ConnectDevice {
    private readonly deviceManagementKitService;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, deviceManagementKitService: DeviceManagementKitService);
    execute({ type }: {
        type: ConnectionType;
    }): Promise<Device>;
}
//# sourceMappingURL=ConnectDevice.d.ts.map