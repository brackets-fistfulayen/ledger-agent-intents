import { Signature } from 'ethers';
import { Factory } from 'inversify';
import { SignedResults } from '../../../api/model/signing/SignedTransaction.js';
import { BackendService } from '../../backend/BackendService.js';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
export type BroadcastTransactionParams = {
    signature: Signature;
    rawTransaction: string;
};
export declare class BroadcastTransaction {
    private readonly backendService;
    private readonly contextService;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, backendService: BackendService, contextService: ContextService);
    execute(params: BroadcastTransactionParams): Promise<SignedResults>;
    private craftRequestFromSignedTransaction;
}
//# sourceMappingURL=BroadcastTransaction.d.ts.map