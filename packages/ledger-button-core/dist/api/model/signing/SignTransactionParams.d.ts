import { RpcMethods } from '../eip/EIPTypes.js';
export type Transaction = {
    chainId: number;
    data: string;
    to: string;
    value: string;
    from?: string;
    gas?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: string;
};
export interface SignTransactionParams {
    transaction: Transaction;
    method: RpcMethods;
    broadcast: boolean;
}
export declare function isSignTransactionParams(params: unknown): params is SignTransactionParams;
//# sourceMappingURL=SignTransactionParams.d.ts.map