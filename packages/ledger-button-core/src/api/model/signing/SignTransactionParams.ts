//EIP-1193 Transaction Object from eth_signTransaction/eth_sendTransaction

import { RpcMethods } from "../eip/EIPTypes.js";

//see: https://ethereum.org/developers/docs/apis/json-rpc/#eth_signtransaction
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

export function isSignTransactionParams(
  params: unknown,
): params is SignTransactionParams {
  return (
    typeof params === "object" &&
    params !== null &&
    "transaction" in params &&
    typeof params.transaction === "object" &&
    "method" in params &&
    typeof params.method === "string" &&
    (params.method === "eth_sendTransaction" ||
      params.method === "eth_signTransaction")
  );
}
