import { OpenAppWithDependenciesDAInput } from '@ledgerhq/device-management-kit';
import { Observable } from 'rxjs';
import { SignFlowStatus } from '../../../api/model/signing/SignFlowStatus.js';
import { SignTypedMessageParams } from '../../../api/model/signing/SignTypedMessageParams.js';
import { Config } from '../../config/model/config.js';
import { DAppConfigService } from '../../dAppConfig/service/DAppConfigService.js';
import { TrackTypedMessageCompleted } from '../../event-tracking/usecase/TrackTypedMessageCompleted.js';
import { TrackTypedMessageStarted } from '../../event-tracking/usecase/TrackTypedMessageStarted.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../storage/StorageService.js';
import { DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
export declare class SignTypedData {
    private readonly deviceManagementKitService;
    private readonly storageService;
    private readonly dappConfigService;
    private readonly config;
    private readonly trackTypedMessageStarted;
    private readonly trackTypedMessageCompleted;
    private readonly logger;
    private pendingStep;
    constructor(loggerFactory: LoggerPublisherFactory, deviceManagementKitService: DeviceManagementKitService, storageService: StorageService, dappConfigService: DAppConfigService, config: Config, trackTypedMessageStarted: TrackTypedMessageStarted, trackTypedMessageCompleted: TrackTypedMessageCompleted);
    execute(params: SignTypedMessageParams): Observable<SignFlowStatus>;
    createOpenAppConfig(): Promise<OpenAppWithDependenciesDAInput>;
    private getTransactionResultForEvent;
}
//# sourceMappingURL=SignTypedData.d.ts.map