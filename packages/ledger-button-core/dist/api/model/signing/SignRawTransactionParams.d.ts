import { RpcMethods } from '../eip/EIPTypes.js';
export interface SignRawTransactionParams {
    transaction: string;
    method: RpcMethods;
    broadcast: boolean;
}
export declare function isSignRawTransactionParams(params: unknown): params is SignRawTransactionParams;
//# sourceMappingURL=SignRawTransactionParams.d.ts.map