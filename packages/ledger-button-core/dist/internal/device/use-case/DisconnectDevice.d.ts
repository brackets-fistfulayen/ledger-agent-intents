import { Factory } from 'inversify';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class DisconnectDevice {
    private readonly deviceManagementKitService;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, deviceManagementKitService: DeviceManagementKitService);
    execute(): Promise<void>;
}
//# sourceMappingURL=DisconnectDevice.d.ts.map