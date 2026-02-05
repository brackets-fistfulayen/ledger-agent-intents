import { Factory } from 'inversify';
import { JSONRPCRequest, JsonRpcResponse } from '../../../api/model/eip/EIPTypes.js';
import { LoggerPublisher } from '../../logger/service/LoggerPublisher.js';
import { LedgerRemoteDatasource } from '../datasource/LedgerRemoteDatasource.js';
export declare class JSONRPCCallUseCase {
    private readonly datasource;
    private readonly logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, datasource: LedgerRemoteDatasource);
    execute(args: JSONRPCRequest): Promise<void | JsonRpcResponse>;
}
//# sourceMappingURL=JSONRPCRequest.d.ts.map