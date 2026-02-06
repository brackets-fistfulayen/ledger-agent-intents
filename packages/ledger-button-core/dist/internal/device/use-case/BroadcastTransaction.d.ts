import { Signature } from 'ethers';
import { SignedResults } from '../../../api/model/signing/SignedTransaction.js';
import { BackendService } from '../../backend/BackendService.js';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
export type BroadcastTransactionParams = {
    signature: Signature;
    rawTransaction: string;
};
export declare class BroadcastTransaction {
    private readonly backendService;
    private readonly contextService;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, backendService: BackendService, contextService: ContextService);
    execute(params: BroadcastTransactionParams): Promise<SignedResults>;
    private craftRequestFromSignedTransaction;
}
//# sourceMappingURL=BroadcastTransaction.d.ts.map