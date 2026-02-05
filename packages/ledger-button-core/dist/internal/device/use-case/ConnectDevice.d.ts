import { Factory } from 'inversify';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { Device } from '../model/Device.js';
import { ConnectionType, DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class ConnectDevice {
    private readonly deviceManagementKitService;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, deviceManagementKitService: DeviceManagementKitService);
    execute({ type }: {
        type: ConnectionType;
    }): Promise<Device>;
}
//# sourceMappingURL=ConnectDevice.d.ts.map