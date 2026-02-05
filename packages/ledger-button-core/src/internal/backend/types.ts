import { infer as ZodInfer, ZodError } from "zod";

import type {
  JSONRPCRequest,
  JsonRpcResponse,
  JsonRpcResponseSuccess,
} from "../../api/model/eip/EIPTypes.js";
import { ConfigResponseSchema } from "./schemas.js";

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

export function isJsonRpcResponse(
  jsonRpc: BroadcastResponse,
): jsonRpc is JsonRpcResponse {
  return (
    "jsonrpc" in jsonRpc &&
    "id" in jsonRpc &&
    ("result" in jsonRpc || "error" in jsonRpc)
  );
}

export function isJsonRpcResponseSuccess(
  jsonRpc: BroadcastResponse,
): jsonRpc is JsonRpcResponseSuccess {
  return "jsonrpc" in jsonRpc && "id" in jsonRpc && "result" in jsonRpc;
}

export function isAlapacaBroadcastResponse(
  jsonRpc: BroadcastResponse,
): jsonRpc is AlapacaBroadcastResponse {
  return "transactionIdentifier" in jsonRpc;
}

export type ConfigRequest = {
  dAppIdentifier: string;
};

export type ConfigResponse = ZodInfer<typeof ConfigResponseSchema>;

export type BackendServiceError = Error;

export type ConfigResponseError = Error | ZodError;
