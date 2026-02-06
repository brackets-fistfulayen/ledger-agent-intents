import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { ConnectionType, DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class SwitchDevice {
    private readonly deviceManagementKitService;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, deviceManagementKitService: DeviceManagementKitService);
    execute({ type }: {
        type: ConnectionType;
    }): Promise<void>;
}
//# sourceMappingURL=SwitchDevice.d.ts.map