import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class DisconnectDevice {
    private readonly deviceManagementKitService;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, deviceManagementKitService: DeviceManagementKitService);
    execute(): Promise<void>;
}
//# sourceMappingURL=DisconnectDevice.d.ts.map