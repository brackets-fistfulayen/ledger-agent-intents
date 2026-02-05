/**
 * RPC methods handled locally by the provider (not broadcasted to Node RPC)
 * These methods have local handlers in LedgerEIP1193Provider
 */
export const LOCALLY_HANDLED_RPC_METHODS = [
  // Account and chain queries
  "eth_accounts",
  "eth_requestAccounts",
  "eth_chainId",
  // Signing and transaction operations
  "eth_sign",
  "personal_sign",
  "eth_signTypedData",
  "eth_signTypedData_v4",
  "eth_sendTransaction",
  "eth_signTransaction",
  "eth_signRawTransaction",
  "eth_sendRawTransaction",
  // EIP-specific methods
  "wallet_switchEthereumChain",
] as const;

/**
 * RPC methods broadcasted to Node RPC
 * These methods are forwarded directly to the Ethereum node without local handling
 */
export const BROADCASTED_TO_NODE_RPC_METHODS = [
  "eth_blockNumber",
  "eth_getBalance",
  "eth_getCode",
  "eth_estimateGas",
  "eth_call",
] as const;

/**
 * All supported RPC methods.
 * Combines both locally handled methods and methods broadcasted to Node RPC.
 */
export const SUPPORTED_RPC_METHODS = [
  ...LOCALLY_HANDLED_RPC_METHODS,
  ...BROADCASTED_TO_NODE_RPC_METHODS,
] as const;

export function isSupportedRpcMethod(method: string): boolean {
  return SUPPORTED_RPC_METHODS.includes(
    method as (typeof SUPPORTED_RPC_METHODS)[number],
  );
}
