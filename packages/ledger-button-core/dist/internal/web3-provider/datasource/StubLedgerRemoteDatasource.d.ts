import { JSONRPCRequest } from '../../../api/model/eip/EIPTypes.js';
import { LedgerRemoteDatasource } from './LedgerRemoteDatasource.js';
export declare class StubLedgerRemoteDatasource extends LedgerRemoteDatasource {
    JSONRPCRequest(args: JSONRPCRequest): Promise<import('purify-ts').Either<never, {
        jsonrpc: string;
        id: number;
        result: any;
        error: {
            code: 4200;
            message: string;
        };
    }>>;
}
//# sourceMappingURL=StubLedgerRemoteDatasource.d.ts.map