import { OpenAppWithDependenciesDAInput } from '@ledgerhq/device-management-kit';
import { Factory } from 'inversify';
import { Observable } from 'rxjs';
import { SignFlowStatus } from '../../../api/model/signing/SignFlowStatus.js';
import { SignRawTransactionParams } from '../../../api/model/signing/SignRawTransactionParams.js';
import { Config } from '../../config/model/config.js';
import { DAppConfigService } from '../../dAppConfig/service/DAppConfigService.js';
import { TrackTransactionCompleted } from '../../event-tracking/usecase/TrackTransactionCompleted.js';
import { TrackTransactionStarted } from '../../event-tracking/usecase/TrackTransactionStarted.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { ModalService } from '../../modal/service/ModalService.js';
import { StorageService } from '../../storage/StorageService.js';
import { DeviceManagementKitService } from '../service/DeviceManagementKitService.js';
import { BroadcastTransaction } from './BroadcastTransaction.js';
export declare class SignRawTransaction {
    private readonly deviceManagementKitService;
    private readonly storageService;
    private readonly config;
    private readonly dappConfigService;
    private readonly broadcastTransactionUseCase;
    private readonly trackTransactionStarted;
    private readonly trackTransactionCompleted;
    private readonly modalService;
    private readonly logger;
    private pendingStep;
    constructor(loggerFactory: Factory<LoggerPublisher>, deviceManagementKitService: DeviceManagementKitService, storageService: StorageService, config: Config, dappConfigService: DAppConfigService, broadcastTransactionUseCase: BroadcastTransaction, trackTransactionStarted: TrackTransactionStarted, trackTransactionCompleted: TrackTransactionCompleted, modalService: ModalService);
    execute(params: SignRawTransactionParams): Observable<SignFlowStatus>;
    createOpenAppConfig(): Promise<OpenAppWithDependenciesDAInput>;
    private getTransactionResultForEvent;
}
//# sourceMappingURL=SignRawTransaction.d.ts.map