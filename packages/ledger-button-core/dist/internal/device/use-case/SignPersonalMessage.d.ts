import { OpenAppWithDependenciesDAInput } from '@ledgerhq/device-management-kit';
import { Factory } from 'inversify';
import { Observable } from 'rxjs';
import { SignFlowStatus } from '../../../api/model/signing/SignFlowStatus.js';
import { SignPersonalMessageParams } from '../../../api/model/signing/SignPersonalMessageParams.js';
import { Config } from '../../config/model/config.js';
import { DAppConfigService } from '../../dAppConfig/service/DAppConfigService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../storage/StorageService.js';
import { DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class SignPersonalMessage {
    private readonly deviceManagementKitService;
    private readonly storageService;
    private readonly dappConfigService;
    private readonly config;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, deviceManagementKitService: DeviceManagementKitService, storageService: StorageService, dappConfigService: DAppConfigService, config: Config);
    execute(params: SignPersonalMessageParams): Observable<SignFlowStatus>;
    createOpenAppConfig(): Promise<OpenAppWithDependenciesDAInput>;
    private getTransactionResultForEvent;
}
//# sourceMappingURL=SignPersonalMessage.d.ts.map