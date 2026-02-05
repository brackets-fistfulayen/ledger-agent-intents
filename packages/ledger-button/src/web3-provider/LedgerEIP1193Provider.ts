/**
 * Ledger EIP-1193 Provider
 *
 * A complete implementation of the EIP-1193 Ethereum Provider JavaScript API
 * for Ledger hardware wallets.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193
 * @see https://eips.ethereum.org/EIPS/eip-1102
 * @see https://eips.ethereum.org/EIPS/eip-6963
 * @see https://eips.ethereum.org/EIPS/eip-2255
 */

import "../ledger-button-app.js";

import {
  Account,
  BlindSigningDisabledError,
  BroadcastTransactionError,
  // type ChainInfo,
  CommonEIP1193ErrorCode,
  type EIP1193Provider,
  type EIP6963AnnounceProviderEvent,
  type EIP6963RequestProviderEvent,
  hexToUtf8,
  IncorrectSeedError,
  isBroadcastedTransactionResult,
  isSignedMessageOrTypedDataResult,
  isSignedTransactionResult,
  LedgerButtonError,
  type ProviderConnectInfo,
  type ProviderEvent,
  type ProviderMessage,
  type ProviderRpcError,
  type RequestArguments,
  type RpcMethods,
  TypedData,
  UserRejectedTransactionError,
} from "@ledgerhq/ledger-wallet-provider-core";
import { LedgerButtonCore } from "@ledgerhq/ledger-wallet-provider-core";
import { getChainIdFromCurrencyId } from "@ledgerhq/ledger-wallet-provider-core";
import { Subscription } from "rxjs";

import { LedgerButtonApp } from "../ledger-button-app.js";
import { isSupportedChainId } from "./supportedChains.js";
import { isSupportedRpcMethod } from "./supportedRpcMethods.js";

export class LedgerEIP1193Provider
  extends EventTarget
  implements EIP1193Provider
{
  private _isConnected = false;
  private _selectedAccount: string | null = null;
  private _selectedChainId = -1;

  private _id = 0;

  public isLedgerButton = true;

  private _pendingRequest: RequestArguments | null = null;
  private _pendingPromise: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  } | null = null;

  // NOTE: Tracking listeners by function reference
  // This is a workaround to wrap the event listener in the `on` method
  // so we can remove it later
  private _listeners: Map<
    (args: unknown) => void,
    (e: CustomEvent | Event) => void
  > = new Map();

  private _currentEvent: string | null = null;

  private _contextSubscription?: Subscription;

  constructor(
    private readonly core: LedgerButtonCore,
    private readonly app: LedgerButtonApp,
  ) {
    super();

    window.addEventListener("ledger-provider-disconnect", () => {
      this.disconnect();
    });

    window.addEventListener("ledger-provider-close", () => {
      if (this._currentEvent) {
        window.dispatchEvent(
          new CustomEvent(this._currentEvent, {
            bubbles: true,
            composed: true,
            detail: {
              status: "error",
              error: new ModalClosedError("User closed the modal"),
            },
          }),
        );
      }
    });

    this.subscribeToContextChanges();

    setInterval(() => {
      if (
        this._pendingRequest &&
        !this.app.isModalOpen &&
        this._pendingPromise
      ) {
        const tmpRequest = this._pendingRequest;
        this._pendingRequest = null;

        // Wait for 1 second before executing the pending request and resolve the promise
        // Wait is needed to avoid race condition with the modal open event (to be improved)
        new Promise((resolve) => setTimeout(resolve, 1000))
          .then(() => {
            return this.executeRequest(tmpRequest);
          })
          .then((result) => {
            if (this._pendingPromise) {
              this._pendingPromise.resolve(result);
              this._pendingPromise = null;
            }
          })
          .catch((error) => {
            if (this._pendingPromise) {
              this._pendingPromise.reject(error);
              this._pendingPromise = null;
            }
          });
      }
    }, 1000);
  }

  public async request({ method, params }: RequestArguments) {
    console.log("request in LedgerEIP1193Provider", { method, params });

    if (this._pendingPromise) {
      return this.createError(
        CommonEIP1193ErrorCode.InternalError,
        "Ledger Provider is busy",
      );
    }

    if (this.app.isModalOpen) {
      this._pendingRequest = { method, params };
      return new Promise<unknown>((resolve, reject) => {
        this._pendingPromise = { resolve, reject };
      });
    }

    // If modal is not open, execute the request immediately
    return this.executeRequest({ method, params });
  }

  public on<TEvent extends keyof ProviderEvent & string>(
    eventName: TEvent,
    listener: (args: ProviderEvent[TEvent]) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._listeners.set(listener as any, (e) => {
      // NOTE: we should not handle non-custom events here
      if (e instanceof CustomEvent) {
        listener(e.detail);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = this._listeners.get(listener as any);
    if (!fn) return this;

    this.addEventListener(eventName, fn);
    return this;
  }

  public removeListener<TEvent extends keyof ProviderEvent & string>(
    eventName: TEvent,
    listener: (args: ProviderEvent[TEvent]) => void,
  ): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = this._listeners.get(listener as any);
    if (!fn) return this;
    this.removeEventListener(eventName, fn);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this._listeners.delete(listener as any);
    return this;
  }

  public isConnected(): boolean {
    return this._isConnected;
  }

  public async connect(): Promise<void> {
    // TODO: Logic to check if we are connected to a chain
    if (!this._isConnected) {
      this._isConnected = true;
      this.dispatchEvent(
        new CustomEvent<ProviderConnectInfo>("connect", {
          bubbles: true,
          composed: true,
          detail: {
            chainId: "0x1", // TODO: Replace with the actual chainId
          },
        }),
      );
    }
  }

  public navigationIntent(intent: string, params?: unknown): void {
    this.app.navigationIntent(intent, params);
  }

  public async disconnect(
    code = 1000, // NOTE: Code here must follow the [CloseEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes) convention
    message = "Provider disconnected",
    data?: unknown,
  ): Promise<void> {
    // TODO: Logic to disconnect from the chain
    if (this._isConnected) {
      this._isConnected = false;

      this.core.disconnect();
      this._isConnected = false;
      this._selectedAccount = null;
      this._selectedChainId = -1;
      this._currentEvent = null;

      // Clean up pending request on disconnect
      if (this._pendingPromise) {
        this._pendingPromise.reject(this.createError(code, message, data));
        this._pendingPromise = null;
        this._pendingRequest = null;
      }

      // Keep context subscription active so we can detect when user selects a new account
      // The subscription will call setSelectedAccount which will re-connect

      // Emit accountsChanged with empty array to notify dApps of disconnect
      this.dispatchEvent(
        new CustomEvent<string[]>("accountsChanged", {
          bubbles: true,
          composed: true,
          detail: [],
        }),
      );

      this.dispatchEvent(
        new CustomEvent<ProviderRpcError>("disconnect", {
          bubbles: true,
          composed: true,
          detail: this.createError(code, message, data),
        }),
      );
    }
  }

  private subscribeToContextChanges() {
    if (this._contextSubscription) {
      this._contextSubscription.unsubscribe();
    }

    this._contextSubscription = this.core
      .observeContext()
      .subscribe((context) => {
        if (context.selectedAccount) {
          const newAddress = context.selectedAccount.freshAddress;
          const newChainId = getChainIdFromCurrencyId(
            context.selectedAccount.currencyId,
          );

          const hasAddressChanged = this._selectedAccount !== newAddress;
          const hasChainIdChanged = this._selectedChainId !== newChainId;

          if (hasAddressChanged) {
            this.setSelectedAccount(context.selectedAccount);
          }

          if (hasChainIdChanged) {
            this.setSelectedChainId(newChainId);
          }
        } else {
          this.disconnect();
        }
      });
  }

  private setSelectedAccount(account: Account) {
    if (
      this._selectedAccount &&
      this._selectedAccount === account.freshAddress &&
      this._isConnected
    ) {
      return;
    }
    this._isConnected = true;
    this._selectedAccount = account.freshAddress;

    // Re-subscribe to context changes if not already subscribed
    // (e.g., after a disconnect)
    if (!this._contextSubscription) {
      this.subscribeToContextChanges();
    }

    this.dispatchEvent(
      new CustomEvent<string[]>("accountsChanged", {
        bubbles: true,
        composed: true,
        detail: [this._selectedAccount],
      }),
    );
  }

  private setSelectedChainId(chainId: number) {
    if (this._selectedChainId === chainId) {
      return;
    }
    this._selectedChainId = chainId;
    this.dispatchEvent(
      new CustomEvent<string>("chainChanged", {
        bubbles: true,
        composed: true,
        detail: "0x" + chainId.toString(16),
      }),
    );
  }

  private async handleAccounts(): Promise<string[]> {
    return new Promise((resolve) => {
      const selectedAccount = this.core.getSelectedAccount();
      //Selected account is already set and the same as the selected account in core
      if (
        this._selectedAccount &&
        selectedAccount &&
        selectedAccount.freshAddress === this._selectedAccount
      ) {
        return resolve([this._selectedAccount]);
      }

      if (selectedAccount) {
        this.setSelectedAccount(selectedAccount);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return resolve([this._selectedAccount!]);
      }

      //SHOULD NEVER HAPPEN
      return resolve([]);
    });
  }

  // Handlers for the different RPC methods
  private async handleRequestAccounts(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this._currentEvent = "ledger-provider-account-selected";
      const selectedAccount = this.core.getSelectedAccount();

      if (selectedAccount) {
        this._selectedAccount = selectedAccount.freshAddress;

        //Update the selected chain id
        const address = selectedAccount.freshAddress;
        const chainId = getChainIdFromCurrencyId(selectedAccount.currencyId);

        this.setSelectedAccount(selectedAccount);
        this.setSelectedChainId(chainId);
        return resolve([address]);
      } else {
        window.addEventListener(
          "ledger-provider-account-selected",
          (e) => {
            this._currentEvent = null;
            if (e.detail.status === "error") {
              return reject(this.mapErrors(e.detail.error));
            }

            if (e.detail.status === "success") {
              //Update the selected account

              this._selectedAccount = e.detail.account.freshAddress;
              this.setSelectedAccount(e.detail.account);

              //Update the selected chain id
              const chainId = getChainIdFromCurrencyId(
                e.detail.account.currencyId,
              );
              this.setSelectedChainId(chainId);

              //Update the connected status
              this._isConnected = true;
              resolve([e.detail.account.freshAddress]);
            }
          },
          {
            once: true,
          },
        );

        this.app.navigationIntent("selectAccount");
      }
    });
  }

  private async handleSignTransaction(
    params: unknown[],
    method: RpcMethods,
    broadcast = false,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._selectedAccount) {
        return reject(
          this.createError(
            CommonEIP1193ErrorCode.Unauthorized,
            "No account selected",
          ),
        );
      }

      this._currentEvent = "ledger-provider-sign";

      let tx: Record<string, unknown> | string;
      //Sanitize transaction for EIP-1193
      if (typeof params[0] === "object") {
        const transaction = params[0] as Record<string, unknown>;
        tx = transaction;
      } else {
        tx = params[0] as string;
      }

      window.addEventListener(
        "ledger-provider-sign",
        (e) => {
          this._currentEvent = null;
          if (e.detail.status === "success") {
            if (isBroadcastedTransactionResult(e.detail.data)) {
              return resolve(e.detail.data.hash);
            }
            if (isSignedTransactionResult(e.detail.data)) {
              return resolve(e.detail.data.signedRawTransaction);
            }
          }

          if (e.detail.status === "error") {
            return reject(this.mapErrors(e.detail.error));
          }
        },
        {
          once: true,
        },
      );

      this.app.navigationIntent("signTransaction", {
        transaction: tx,
        method,
        broadcast,
      });
    });
  }

  private async handleSignTypedData(
    params: unknown[],
    method: RpcMethods,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._selectedAccount) {
        return reject(
          this.createError(
            CommonEIP1193ErrorCode.Unauthorized,
            "No account selected",
          ),
        );
      }

      this._currentEvent = "ledger-provider-sign";

      window.addEventListener(
        "ledger-provider-sign",
        (e) => {
          this._currentEvent = null;
          if (e.detail.status === "success") {
            if (isSignedMessageOrTypedDataResult(e.detail.data)) {
              return resolve(e.detail.data.signature);
            }
          }

          if (e.detail.status === "error") {
            return reject(this.mapErrors(e.detail.error));
          }
        },
        {
          once: true,
        },
      );

      if (
        typeof params[0] === "string" &&
        params[0].toLowerCase() !== this._selectedAccount.toLowerCase()
      ) {
        return reject(
          this.createError(
            CommonEIP1193ErrorCode.Unauthorized,
            "Address mismatch",
          ),
        );
      }

      if (typeof params[1] === "string") {
        try {
          const p = JSON.parse(params[1] as string) as TypedData;
          this.app.navigationIntent("signTransaction", [params[0], p, method]);
          return;
        } catch (error) {
          return reject(
            this.createError(
              CommonEIP1193ErrorCode.InvalidParams,
              "Invalid typed data",
              {
                error,
              },
            ),
          );
        }
      }

      this.app.navigationIntent("signTransaction", [...params, method]);
    });
  }

  private async handleSignPersonalMessage(
    params: unknown[],
    method: RpcMethods,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._selectedAccount) {
        return reject(
          this.createError(
            CommonEIP1193ErrorCode.Unauthorized,
            "No account selected",
          ),
        );
      }

      this._currentEvent = "ledger-provider-sign";

      window.addEventListener(
        "ledger-provider-sign",
        (e) => {
          this._currentEvent = null;
          if (e.detail.status === "success") {
            if (isSignedMessageOrTypedDataResult(e.detail.data)) {
              return resolve(e.detail.data.signature);
            }
          }
          if (e.detail.status === "error") {
            return reject(this.mapErrors(e.detail.error));
          }
        },
        {
          once: true,
        },
      );

      //CF: https://docs.metamask.io/wallet/reference/json-rpc-methods/personal_sign
      if (method === "personal_sign") {
        const address = params[1] as string;
        const messageHex = params[0] as string;
        const message = hexToUtf8(messageHex);

        this.app.navigationIntent("signTransaction", [
          address,
          message,
          method,
        ]);
      } else {
        //eth_sign
        this.app.navigationIntent("signTransaction", [...params, method]);
      }
    });
  }

  private async handleSwitchChainId(params: unknown[]): Promise<null> {
    return new Promise((resolve, reject) => {
      if (!this._isConnected) {
        return reject(
          this.createError(CommonEIP1193ErrorCode.Disconnected, "Disconnected"),
        );
      }

      const chainId = (params[0] as { chainId: string }).chainId;
      const chainIdNumber = parseInt(chainId, 16);

      if (!isSupportedChainId(chainIdNumber.toString())) {
        return reject(
          this.createError(
            CommonEIP1193ErrorCode.ChainDisconnected,
            "Unsupported chain",
          ),
        );
      }

      this.core.setChainId(chainIdNumber);
      this.setSelectedChainId(chainIdNumber);

      //returns null if the active chain is switched.
      //cf. https://docs.metamask.io/wallet/reference/json-rpc-methods/wallet_switchEthereumChain#returns
      resolve(null);
    });
  }

  private async handleChainId(): Promise<string> {
    return new Promise((resolve) => {
      //Chain ID must be in hex format => https://ethereum.org/developers/docs/apis/json-rpc/#eth_chainId
      resolve("0x" + this._selectedChainId.toString(16));
    });
  }

  handlers = {
    eth_accounts: async (_: unknown, _method: RpcMethods) =>
      this.handleAccounts(),
    eth_requestAccounts: async (_: unknown, _method: RpcMethods) =>
      this.handleRequestAccounts(),
    eth_chainId: async (_: unknown) => this.handleChainId(),
    eth_sendTransaction: async (params: unknown[], method: RpcMethods) =>
      this.handleSignTransaction(params, method, true),
    eth_signTransaction: async (params: unknown[], method: RpcMethods) =>
      this.handleSignTransaction(params, method),
    eth_signRawTransaction: async (params: unknown[], method: RpcMethods) =>
      this.handleSignTransaction(params, method),
    eth_sign: async (params: unknown[], method: RpcMethods) =>
      this.handleSignPersonalMessage(params, method),
    personal_sign: async (params: unknown[], method: RpcMethods) =>
      this.handleSignPersonalMessage(params, method),
    eth_sendRawTransaction: async (params: unknown[], method: RpcMethods) =>
      this.handleSignTransaction(params, method, true),
    eth_signTypedData: async (params: unknown[], method: RpcMethods) =>
      this.handleSignTypedData(params, method),
    eth_signTypedData_v4: async (params: unknown[], method: RpcMethods) =>
      this.handleSignTypedData(params, method),
    wallet_switchEthereumChain: async (
      params: unknown[],
      _method: RpcMethods,
    ) => this.handleSwitchChainId(params),
  } as const;

  // Private method to execute request logic
  private async executeRequest({ method, params }: RequestArguments) {
    if (method in this.handlers) {
      const res = await this.handlers[method as keyof typeof this.handlers](
        params as unknown[],
        method,
      );

      return res;
    }

    if (isSupportedRpcMethod(method)) {
      const res = await this.core.jsonRpcRequest({
        jsonrpc: "2.0",
        id: this._id++,
        method,
        params,
      });
      return res;
    }

    return this.createError(
      CommonEIP1193ErrorCode.UnsupportedMethod,
      `Method ${method} is not supported, { method: ${method}, params: ${JSON.stringify(params)} }`,
    );
  }

  private createError(
    code: number,
    message: string,
    data?: unknown,
  ): ProviderRpcError {
    const err = new Error(message) as ProviderRpcError;
    const error = err;
    error.code = code;
    error.data = data;
    error.stack = err.stack;
    return error;
  }

  private mapErrors(error: unknown) {
    switch (true) {
      case error instanceof UserRejectedTransactionError:
        return this.createError(
          CommonEIP1193ErrorCode.UserRejectedRequest,
          "User rejected transaction",
          error,
        );
      case error instanceof BroadcastTransactionError:
        return this.createError(
          CommonEIP1193ErrorCode.InternalError,
          "Broadcast transaction failed",
          error,
        );
      case error instanceof BlindSigningDisabledError:
        return this.createError(
          CommonEIP1193ErrorCode.InternalError,
          "Blind signing disabled",
          error,
        );
      case error instanceof IncorrectSeedError:
        return this.createError(
          CommonEIP1193ErrorCode.Unauthorized,
          "Address mismatch",
          error,
        );
      case error instanceof ModalClosedError:
        return this.createError(
          CommonEIP1193ErrorCode.UserRejectedRequest,
          "User closed the modal",
          error,
        );
      default:
        return this.createError(
          CommonEIP1193ErrorCode.InternalError,
          "Unknown error",
          error,
        );
    }
  }
}

class ModalClosedError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "ModalClosedError", context);
  }
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
