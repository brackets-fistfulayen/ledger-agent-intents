import { Observable } from 'rxjs';
import { SignedResults, SignFlowStatus, SignRawTransactionParams, SignTransactionParams, SignTypedMessageParams } from '../../../api/index.js';
import { Signature } from '../../../api/model/eip/EIPTypes.js';
import { SignPersonalMessageParams } from '../../../api/model/signing/SignPersonalMessageParams.js';
export declare enum TransactionStatus {
    IDLE = "idle",
    SIGNING = "signing",
    SIGNED = "signed",
    ERROR = "error",
    USER_INTERACTION_NEEDED = "user-interaction-needed"
}
export interface TransactionResult {
    status: TransactionStatus;
    data?: SignedResults | Signature;
    error?: Error;
}
export interface TransactionService {
    sign(params: SignTransactionParams | SignRawTransactionParams | SignTypedMessageParams | SignPersonalMessageParams): Observable<SignFlowStatus>;
    getPendingTransaction(): SignTransactionParams | SignRawTransactionParams | SignTypedMessageParams | SignPersonalMessageParams | undefined;
    setPendingTransaction(params: SignTransactionParams | SignRawTransactionParams | SignTypedMessageParams | SignPersonalMessageParams | undefined): void;
    reset(): void;
}
//# sourceMappingURL=TransactionService.d.ts.map