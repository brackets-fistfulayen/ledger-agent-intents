import { DiscoveredDevice } from '@ledgerhq/device-management-kit';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class ListAvailableDevices {
    private readonly deviceManagementKitService;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, deviceManagementKitService: DeviceManagementKitService);
    execute(): Promise<DiscoveredDevice[]>;
}
//# sourceMappingURL=ListAvailableDevices.d.ts.map