import { Observable } from 'rxjs';
import { SignFlowStatus } from '../../../api/model/signing/SignFlowStatus.js';
import { SignPersonalMessageParams } from '../../../api/model/signing/SignPersonalMessageParams.js';
import { SignRawTransactionParams } from '../../../api/model/signing/SignRawTransactionParams.js';
import { SignTransactionParams } from '../../../api/model/signing/SignTransactionParams.js';
import { SignTypedMessageParams } from '../../../api/model/signing/SignTypedMessageParams.js';
import { SignPersonalMessage } from '../../../internal/device/use-case/SignPersonalMessage.js';
import { SignRawTransaction } from '../../../internal/device/use-case/SignRawTransaction.js';
import { SignTransaction } from '../../device/use-case/SignTransaction.js';
import { SignTypedData } from '../../device/use-case/SignTypedData.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { TransactionService } from './TransactionService.js';
export declare class DefaultTransactionService implements TransactionService {
    private readonly signTransactionUseCase;
    private readonly signRawTransactionUseCase;
    private readonly signTypedDataUseCase;
    private readonly signPersonalMessageUseCase;
    private _pendingParams?;
    private readonly logger;
    constructor(signTransactionUseCase: SignTransaction, signRawTransactionUseCase: SignRawTransaction, signTypedDataUseCase: SignTypedData, signPersonalMessageUseCase: SignPersonalMessage, loggerFactory: (prefix: string) => LoggerPublisher);
    sign(params: SignRawTransactionParams | SignTypedMessageParams | SignTransactionParams | SignPersonalMessageParams): Observable<SignFlowStatus>;
    getPendingTransaction(): SignTransactionParams | SignRawTransactionParams | SignTypedMessageParams | SignPersonalMessageParams | undefined;
    setPendingTransaction(params?: SignTransactionParams | SignRawTransactionParams | SignTypedMessageParams | SignPersonalMessageParams): void;
    reset(): void;
}
//# sourceMappingURL=DefaultTransactionService.d.ts.map