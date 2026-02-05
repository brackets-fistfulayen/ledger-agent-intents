import { DiscoveredDevice } from '@ledgerhq/device-management-kit';
import { Factory } from 'inversify';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class ListAvailableDevices {
    private readonly deviceManagementKitService;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, deviceManagementKitService: DeviceManagementKitService);
    execute(): Promise<DiscoveredDevice[]>;
}
//# sourceMappingURL=ListAvailableDevices.d.ts.map