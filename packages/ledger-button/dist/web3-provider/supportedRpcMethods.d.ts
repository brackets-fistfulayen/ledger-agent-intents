/**
 * RPC methods handled locally by the provider (not broadcasted to Node RPC)
 * These methods have local handlers in LedgerEIP1193Provider
 */
export declare const LOCALLY_HANDLED_RPC_METHODS: readonly ["eth_accounts", "eth_requestAccounts", "eth_chainId", "eth_sign", "personal_sign", "eth_signTypedData", "eth_signTypedData_v4", "eth_sendTransaction", "eth_signTransaction", "eth_signRawTransaction", "eth_sendRawTransaction", "wallet_switchEthereumChain"];
/**
 * RPC methods broadcasted to Node RPC
 * These methods are forwarded directly to the Ethereum node without local handling
 */
export declare const BROADCASTED_TO_NODE_RPC_METHODS: readonly ["eth_blockNumber", "eth_getBalance", "eth_getCode", "eth_estimateGas", "eth_call"];
/**
 * All supported RPC methods.
 * Combines both locally handled methods and methods broadcasted to Node RPC.
 */
export declare const SUPPORTED_RPC_METHODS: readonly ["eth_accounts", "eth_requestAccounts", "eth_chainId", "eth_sign", "personal_sign", "eth_signTypedData", "eth_signTypedData_v4", "eth_sendTransaction", "eth_signTransaction", "eth_signRawTransaction", "eth_sendRawTransaction", "wallet_switchEthereumChain", "eth_blockNumber", "eth_getBalance", "eth_getCode", "eth_estimateGas", "eth_call"];
export declare function isSupportedRpcMethod(method: string): boolean;
//# sourceMappingURL=supportedRpcMethods.d.ts.map