export type { Signature } from '@ledgerhq/device-signer-kit-ethereum';
export type RpcMethods = "eth_accounts" | "eth_requestAccounts" | "eth_chainId" | "eth_estimateGas" | "eth_getBalance" | "eth_getBlockByNumber" | "eth_getTransactionCount" | "eth_maxPriorityFeePerGas" | "eth_sendTransaction" | "eth_sendRawTransaction" | "eth_signTransaction" | "eth_signRawTransaction" | "eth_signTypedData" | "eth_signTypedData_v4" | "eth_sign" | "personal_sign" | "wallet_switchEthereumChain";
export type JSONRPCRequest = {
    readonly jsonrpc: string;
    readonly id: number;
    readonly method: RpcMethods;
    readonly params: readonly unknown[] | object;
};
export type JsonRpcResponseSuccess = {
    id: number;
    jsonrpc: string;
    result: string | object;
};
export type JsonRpcResponseError = {
    id: number;
    jsonrpc: string;
    error: {
        code: number;
        message: string;
    };
};
export type JsonRpcResponse = JsonRpcResponseSuccess | JsonRpcResponseError;
export type RequestArguments = Pick<JSONRPCRequest, "method" | "params">;
export interface ProviderRpcError extends Error {
    code: number;
    data?: unknown;
}
export declare const CommonEIP1193ErrorCode: {
    readonly UserRejectedRequest: 4001;
    readonly Unauthorized: 4100;
    readonly UnsupportedMethod: 4200;
    readonly Disconnected: 4900;
    readonly ChainDisconnected: 4901;
    readonly ParseError: -32700;
    readonly InvalidRequest: -32600;
    readonly MethodNotFound: -32601;
    readonly InvalidParams: -32602;
    readonly InternalError: -32603;
};
export interface ProviderMessage {
    readonly type: string;
    readonly data: unknown;
}
export interface ProviderConnectInfo {
    readonly chainId: string;
}
export interface EIP6963ProviderInfo {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
}
export interface EIP1193Provider {
    request(args: RequestArguments): Promise<unknown>;
    on<TEvent extends keyof ProviderEvent>(eventName: TEvent, listener: (args: ProviderEvent[TEvent]) => void): void;
    removeListener<TEvent extends keyof ProviderEvent>(eventName: TEvent, listener: (args: ProviderEvent[TEvent]) => void): void;
    isConnected(): boolean;
}
export interface EIP6963ProviderDetail {
    info: EIP6963ProviderInfo;
    provider: EIP1193Provider;
}
export interface EIP6963AnnounceProviderEvent extends CustomEvent {
    type: "eip6963:announceProvider";
    detail: EIP6963ProviderDetail;
}
export interface EIP6963RequestProviderEvent extends Event {
    type: "eip6963:requestProvider";
}
export interface EthRequestAccountsResult {
    accounts: string[];
}
export interface EthSendTransactionParams {
    from: string;
    to?: string;
    gas?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    value?: string;
    data?: string;
    nonce?: string;
    type?: string;
    chainId?: string;
}
export type EthSignTransactionParams = EthSendTransactionParams;
export interface PersonalSignParams {
    message: string;
    address: string;
}
export type TypedData = {
    types: Record<string, Array<{
        name: string;
        type: string;
    }>>;
    primaryType: string;
    domain: Record<string, unknown>;
    message: Record<string, unknown>;
};
export interface EthSignTypedDataParams {
    address: string;
    typedData: TypedData;
}
export type ProviderEvent = {
    connect: ProviderConnectInfo;
    disconnect: ProviderRpcError;
    chainChanged: ProviderConnectInfo["chainId"];
    accountsChanged: string[];
    message: ProviderMessage;
};
export interface ChainInfo {
    chainId: string;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls?: string[];
}
//# sourceMappingURL=EIPTypes.d.ts.map