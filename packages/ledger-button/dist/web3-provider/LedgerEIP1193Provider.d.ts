import { EIP1193Provider, EIP6963AnnounceProviderEvent, EIP6963RequestProviderEvent, ProviderConnectInfo, ProviderEvent, ProviderMessage, ProviderRpcError, RequestArguments, RpcMethods, LedgerButtonCore } from '@ledgerhq/ledger-wallet-provider-core';
import { LedgerButtonApp } from '../ledger-button-app.js';
export declare class LedgerEIP1193Provider extends EventTarget implements EIP1193Provider {
    private readonly core;
    private readonly app;
    private _isConnected;
    private _selectedAccount;
    private _selectedChainId;
    private _id;
    isLedgerButton: boolean;
    private _pendingRequest;
    private _pendingPromise;
    private _listeners;
    private _currentEvent;
    private _contextSubscription?;
    constructor(core: LedgerButtonCore, app: LedgerButtonApp);
    request({ method, params }: RequestArguments): Promise<unknown>;
    on<TEvent extends keyof ProviderEvent>(eventName: TEvent, listener: (args: ProviderEvent[TEvent]) => void): this;
    removeListener<TEvent extends keyof ProviderEvent>(eventName: TEvent, listener: (args: ProviderEvent[TEvent]) => void): this;
    isConnected(): boolean;
    connect(): Promise<void>;
    navigationIntent(intent: string, params?: unknown): void;
    disconnect(code?: number, // NOTE: Code here must follow the [CloseEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes) convention
    message?: string, data?: unknown): Promise<void>;
    private subscribeToContextChanges;
    private setSelectedAccount;
    private setSelectedChainId;
    private handleAccounts;
    private handleRequestAccounts;
    private handleSignTransaction;
    private handleSignTypedData;
    private handleSignPersonalMessage;
    private handleSwitchChainId;
    private handleChainId;
    handlers: {
        readonly eth_accounts: (_: unknown, _method: RpcMethods) => Promise<string[]>;
        readonly eth_requestAccounts: (_: unknown, _method: RpcMethods) => Promise<string[]>;
        readonly eth_chainId: (_: unknown) => Promise<string>;
        readonly eth_sendTransaction: (params: unknown[], method: RpcMethods) => Promise<string>;
        readonly eth_signTransaction: (params: unknown[], method: RpcMethods) => Promise<string>;
        readonly eth_signRawTransaction: (params: unknown[], method: RpcMethods) => Promise<string>;
        readonly eth_sign: (params: unknown[], method: RpcMethods) => Promise<string>;
        readonly personal_sign: (params: unknown[], method: RpcMethods) => Promise<string>;
        readonly eth_sendRawTransaction: (params: unknown[], method: RpcMethods) => Promise<string>;
        readonly eth_signTypedData: (params: unknown[], method: RpcMethods) => Promise<string>;
        readonly eth_signTypedData_v4: (params: unknown[], method: RpcMethods) => Promise<string>;
        readonly wallet_switchEthereumChain: (params: unknown[], _method: RpcMethods) => Promise<null>;
    };
    private executeRequest;
    private createError;
    private mapErrors;
}
declare global {
    interface WindowEventMap {
        connect: CustomEvent<ProviderConnectInfo>;
        disconnect: CustomEvent<ProviderRpcError>;
        chainChanged: CustomEvent<string>;
        accountsChanged: CustomEvent<string[]>;
        message: CustomEvent<ProviderMessage>;
        "eip6963:announceProvider": EIP6963AnnounceProviderEvent;
        "eip6963:requestProvider": EIP6963RequestProviderEvent;
    }
}
//# sourceMappingURL=LedgerEIP1193Provider.d.ts.map