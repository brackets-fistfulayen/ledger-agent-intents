import { Factory } from 'inversify';
import { Observable } from 'rxjs';
import { SignFlowStatus } from '../../../api/model/signing/SignFlowStatus.js';
import { SignTransactionParams } from '../../../api/model/signing/SignTransactionParams.js';
import { GasFeeEstimationService } from '../../balance/service/GasFeeEstimationService.js';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../storage/StorageService.js';
import { SignRawTransaction } from './SignRawTransaction.js';
export declare class SignTransaction {
    private readonly gasFeeEstimationService;
    private readonly storageService;
    private readonly signRawTransaction;
    private readonly contextService;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, gasFeeEstimationService: GasFeeEstimationService, storageService: StorageService, signRawTransaction: SignRawTransaction, contextService: ContextService);
    execute(params: SignTransactionParams): Observable<SignFlowStatus>;
    private addFeesToTransaction;
    private addNonceToTransaction;
    private completeTransaction;
}
//# sourceMappingURL=SignTransaction.d.ts.map