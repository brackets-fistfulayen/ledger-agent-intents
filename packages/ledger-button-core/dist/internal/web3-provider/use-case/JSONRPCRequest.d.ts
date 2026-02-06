import { JSONRPCRequest, JsonRpcResponse } from '../../../api/model/eip/EIPTypes.js';
import { LoggerPublisherFactory } from '../../logger/service/LoggerPublisher.js';
import { LedgerRemoteDatasource } from '../datasource/LedgerRemoteDatasource.js';
export declare class JSONRPCCallUseCase {
    private readonly datasource;
    private readonly logger;
    constructor(loggerFactory: LoggerPublisherFactory, datasource: LedgerRemoteDatasource);
    execute(args: JSONRPCRequest): Promise<void | JsonRpcResponse>;
}
//# sourceMappingURL=JSONRPCRequest.d.ts.map