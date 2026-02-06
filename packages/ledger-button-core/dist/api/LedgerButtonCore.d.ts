import { Observable } from 'rxjs';
import { ButtonCoreContext } from './model/ButtonCoreContext.js';
import { JSONRPCRequest } from './model/eip/EIPTypes.js';
import { SignPersonalMessageParams } from './model/index.js';
import { LedgerSyncAuthenticateResponse } from './model/LedgerSyncAuthenticateResponse.js';
import { SignFlowStatus } from './model/signing/SignFlowStatus.js';
import { SignRawTransactionParams } from './model/signing/SignRawTransactionParams.js';
import { SignTransactionParams } from './model/signing/SignTransactionParams.js';
import { SignTypedMessageParams } from './model/signing/SignTypedMessageParams.js';
import { Account } from '../internal/account/service/AccountService.js';
import { BackendService } from '../internal/backend/BackendService.js';
import { WalletActionType } from '../internal/backend/model/trackEvent.js';
import { Config } from '../internal/config/model/config.js';
import { ConnectionType } from '../internal/device/service/DeviceManagementKitService.js';
import { ContainerOptions } from '../internal/diTypes.js';
import { LOG_LEVELS } from '../internal/logger/model/constant.js';
import { TransactionService } from '../internal/transaction/service/TransactionService.js';
export type LedgerButtonCoreOptions = ContainerOptions;
export declare class LedgerButtonCore {
    private readonly opts;
    private container;
    private _pendingTransactionParams?;
    private _pendingAccountId?;
    private readonly _logger;
    private readonly _modalService;
    private readonly _contextService;
    constructor(opts: LedgerButtonCoreOptions);
    private initializeContext;
    private listenDevice;
    disconnect(): Promise<void>;
    connectToDevice(type: ConnectionType): Promise<import('./index.js').Device>;
    disconnectFromDevice(): Promise<void>;
    getReferralUrl(): Promise<string>;
    switchDevice(type: ConnectionType): Promise<void>;
    fetchAccounts(): Promise<Account[]>;
    /**
     * Fetches accounts with progressive balance loading.
     * Returns an Observable that emits:
     * - First: accounts with balance: undefined (accounts available, balances loading)
     * - Then: updated accounts as each balance loads
     * Use this for progressive UI updates with skeleton loading states.
     * Emits 'ledger-accounts-updated' event on window for UI reactivity.
     */
    fetchAccountsWithProgress(): Observable<Account[]>;
    getAccounts(): Account[];
    selectAccount(account: Account): void;
    getSelectedAccount(): Account;
    getDetailedSelectedAccount(): Promise<import('purify-ts').Either<import('../internal/account/use-case/fetchSelectedAccountUseCase.js').AccountError, import('./index.js').DetailedAccount>>;
    getConnectedDevice(): import('./index.js').Device;
    listAvailableDevices(): Promise<import('@ledgerhq/device-management-kit').DiscoveredDevice[]>;
    sign(params: SignTransactionParams | SignRawTransactionParams | SignTypedMessageParams | SignPersonalMessageParams): Observable<SignFlowStatus>;
    setPendingTransactionParams(params: SignRawTransactionParams | SignTransactionParams | undefined): void;
    getPendingTransactionParams(): SignRawTransactionParams | SignTransactionParams | undefined;
    setPendingAccountId(id: string | undefined): void;
    getPendingAccountId(): string | undefined;
    clearPendingAccountId(): void;
    hasConsent(): Promise<boolean>;
    hasRespondedToConsent(): Promise<boolean>;
    giveConsent(): Promise<void>;
    refuseConsent(): Promise<void>;
    removeConsent(): Promise<void>;
    setWelcomeScreenCompleted(): Promise<void>;
    isWelcomeScreenCompleted(): boolean;
    getTransactionService(): TransactionService;
    jsonRpcRequest(args: JSONRPCRequest): Promise<void | import('./index.js').JsonRpcResponse>;
    getBackendService(): BackendService;
    connectToLedgerSync(): Observable<LedgerSyncAuthenticateResponse>;
    private isAuthContext;
    observeContext(): Observable<ButtonCoreContext>;
    getConfig(): Config;
    setLogLevel(logLevel: keyof typeof LOG_LEVELS): void;
    isSupported(): boolean;
    setChainId(chainId: number): void;
    getChainId(): number;
    trackFloatingButtonClick(): Promise<void>;
    trackWalletActionClicked(walletAction: WalletActionType): Promise<void>;
    trackWalletRedirectConfirmed(walletAction: WalletActionType): Promise<void>;
    trackWalletRedirectCancelled(walletAction: WalletActionType): Promise<void>;
}
//# sourceMappingURL=LedgerButtonCore.d.ts.map