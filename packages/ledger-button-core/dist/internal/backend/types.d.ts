import { infer as ZodInfer, ZodError } from 'zod';
import { JSONRPCRequest, JsonRpcResponse, JsonRpcResponseSuccess } from '../../api/model/eip/EIPTypes.js';
import { ConfigResponseSchema } from './schemas.js';
export type Blockchain = {
    name: string;
    chainId: string;
};
export type BroadcastRequest = {
    blockchain: Blockchain;
    rpc: JSONRPCRequest;
};
export type AlapacaBroadcastResponse = {
    transactionIdentifier: string;
};
export type BroadcastResponse = JsonRpcResponse | AlapacaBroadcastResponse;
export declare function isJsonRpcResponse(jsonRpc: BroadcastResponse): jsonRpc is JsonRpcResponse;
export declare function isJsonRpcResponseSuccess(jsonRpc: BroadcastResponse): jsonRpc is JsonRpcResponseSuccess;
export declare function isAlapacaBroadcastResponse(jsonRpc: BroadcastResponse): jsonRpc is AlapacaBroadcastResponse;
export type ConfigRequest = {
    dAppIdentifier: string;
};
export type ConfigResponse = ZodInfer<typeof ConfigResponseSchema>;
export type BackendServiceError = Error;
export type ConfigResponseError = Error | ZodError;
//# sourceMappingURL=types.d.ts.map