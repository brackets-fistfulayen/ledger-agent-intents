import { Factory } from 'inversify';
import { Either } from 'purify-ts';
import { JSONRPCRequest, JsonRpcResponse } from '../../../api/model/eip/EIPTypes.js';
import { BackendService } from '../../backend/BackendService.js';
import { ContextService } from '../../context/ContextService.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
export declare class LedgerRemoteDatasource {
    private readonly loggerFactory;
    private readonly backendService;
    private readonly contextService;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, backendService: BackendService, contextService: ContextService);
    JSONRPCRequest(args: JSONRPCRequest): Promise<Either<Error, JsonRpcResponse>>;
}
//# sourceMappingURL=LedgerRemoteDatasource.d.ts.map