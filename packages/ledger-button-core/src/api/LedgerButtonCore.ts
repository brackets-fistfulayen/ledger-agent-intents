import { DeviceStatus } from "@ledgerhq/device-management-kit";
import { Container, Factory } from "inversify";
import { lastValueFrom, Observable, tap } from "rxjs";

import { ButtonCoreContext } from "./model/ButtonCoreContext.js";
import { JSONRPCRequest } from "./model/eip/EIPTypes.js";
import { SignPersonalMessageParams } from "./model/index.js";
import {
  AuthContext,
  LedgerSyncAuthenticateResponse,
} from "./model/LedgerSyncAuthenticateResponse.js";
import { SignFlowStatus } from "./model/signing/SignFlowStatus.js";
import { SignRawTransactionParams } from "./model/signing/SignRawTransactionParams.js";
import { SignTransactionParams } from "./model/signing/SignTransactionParams.js";
import { SignTypedMessageParams } from "./model/signing/SignTypedMessageParams.js";
import { getChainIdFromCurrencyId } from "./utils/index.js";
import { accountModuleTypes } from "../internal/account/accountModuleTypes.js";
import {
  Account,
  type AccountService,
} from "../internal/account/service/AccountService.js";
import { FetchAccountsWithBalanceUseCase } from "../internal/account/use-case/fetchAccountsWithBalanceUseCase.js";
import type { GetDetailedSelectedAccountUseCase } from "../internal/account/use-case/getDetailedSelectedAccountUseCase.js";
import { backendModuleTypes } from "../internal/backend/backendModuleTypes.js";
import { type BackendService } from "../internal/backend/BackendService.js";
import { type WalletActionType } from "../internal/backend/model/trackEvent.js";
import { configModuleTypes } from "../internal/config/configModuleTypes.js";
import { Config } from "../internal/config/model/config.js";
import { consentModuleTypes } from "../internal/consent/consentModuleTypes.js";
import { type ConsentService } from "../internal/consent/ConsentService.js";
import { contextModuleTypes } from "../internal/context/contextModuleTypes.js";
import { ContextService } from "../internal/context/ContextService.js";
import { dAppConfigModuleTypes } from "../internal/dAppConfig/di/dAppConfigModuleTypes.js";
import { type DAppConfigService } from "../internal/dAppConfig/service/DAppConfigService.js";
import { deviceModuleTypes } from "../internal/device/deviceModuleTypes.js";
import {
  type ConnectionType,
  type DeviceManagementKitService,
} from "../internal/device/service/DeviceManagementKitService.js";
import { ConnectDevice } from "../internal/device/use-case/ConnectDevice.js";
import { DisconnectDevice } from "../internal/device/use-case/DisconnectDevice.js";
import { ListAvailableDevices } from "../internal/device/use-case/ListAvailableDevices.js";
import { SwitchDevice } from "../internal/device/use-case/SwitchDevice.js";
import { createContainer } from "../internal/di.js";
import { type ContainerOptions } from "../internal/diTypes.js";
import { eventTrackingModuleTypes } from "../internal/event-tracking/eventTrackingModuleTypes.js";
import { TrackFloatingButtonClick } from "../internal/event-tracking/usecase/TrackFloatingButtonClick.js";
import { TrackLedgerSyncActivated } from "../internal/event-tracking/usecase/TrackLedgerSyncActivated.js";
import { TrackLedgerSyncOpened } from "../internal/event-tracking/usecase/TrackLedgerSyncOpened.js";
import { TrackOnboarding } from "../internal/event-tracking/usecase/TrackOnboarding.js";
import { TrackWalletAction } from "../internal/event-tracking/usecase/TrackWalletAction.js";
import { ledgerSyncModuleTypes } from "../internal/ledgersync/ledgerSyncModuleTypes.js";
import { LedgerSyncService } from "../internal/ledgersync/service/LedgerSyncService.js";
import { loggerModuleTypes } from "../internal/logger/loggerModuleTypes.js";
import { LOG_LEVELS } from "../internal/logger/model/constant.js";
import { LoggerPublisher } from "../internal/logger/service/LoggerPublisher.js";
import { modalModuleTypes } from "../internal/modal/modalModuleTypes.js";
import { ModalService } from "../internal/modal/service/ModalService.js";
import { storageModuleTypes } from "../internal/storage/storageModuleTypes.js";
import { type StorageService } from "../internal/storage/StorageService.js";
import { MigrateDbUseCase } from "../internal/storage/usecases/MigrateDbUseCase/MigrateDbUseCase.js";
import { type TransactionService } from "../internal/transaction/service/TransactionService.js";
import { transactionModuleTypes } from "../internal/transaction/transactionModuleTypes.js";
import { JSONRPCCallUseCase } from "../internal/web3-provider/use-case/JSONRPCRequest.js";
import { web3ProviderModuleTypes } from "../internal/web3-provider/web3ProviderModuleTypes.js";

export type LedgerButtonCoreOptions = ContainerOptions;
export class LedgerButtonCore {
  private container!: Container;
  private _pendingTransactionParams?:
    | SignRawTransactionParams
    | SignTransactionParams;
  private _pendingAccountId?: string;
  private readonly _logger: LoggerPublisher;
  // @ts-expect-error making sure ModalService is created, not used
  private readonly _modalService: ModalService;
  private readonly _contextService: ContextService;

  constructor(private readonly opts: LedgerButtonCoreOptions) {
    this.container = createContainer(this.opts);
    const loggerFactory = this.container.get<Factory<LoggerPublisher>>(
      loggerModuleTypes.LoggerPublisher,
    );
    this._logger = loggerFactory("[Ledger Button Core]");
    this._modalService = this.container.get<ModalService>(
      modalModuleTypes.ModalService,
    );
    this._contextService = this.container.get<ContextService>(
      contextModuleTypes.ContextService,
    );
    this.initializeContext();
  }

  private async initializeContext() {
    this._logger.debug("Initializing context");

    //Fetch dApp config that will be used later for fetching supported blockchains/referral url/etc.
    await this.container
      .get<DAppConfigService>(dAppConfigModuleTypes.DAppConfigService)
      .getDAppConfig();

    //TODO throw error if dApp config is not found ?
    // Migrate database to latest version
    await this.container
      .get<MigrateDbUseCase>(storageModuleTypes.MigrateDbUseCase)
      .execute();

    // Restore selected account from storage
    const selectedAccount = this.container
      .get<StorageService>(storageModuleTypes.StorageService)
      .getSelectedAccount()
      .extract();

    // Restore trust chain id from storage
    const trustChainId = this.container
      .get<StorageService>(storageModuleTypes.StorageService)
      .getTrustChainId()
      .extract();

    const isTrustChainValid = this.container
      .get<StorageService>(storageModuleTypes.StorageService)
      .isTrustChainValid();

    if (trustChainId && !isTrustChainValid) {
      this._logger.debug("Logging out, trust chain is expired");
      await this.disconnect();
    }

    const chainId = selectedAccount
      ? getChainIdFromCurrencyId(selectedAccount.currencyId)
      : 1;

    const welcomeScreenCompleted = await this.container
      .get<StorageService>(storageModuleTypes.StorageService)
      .isWelcomeScreenCompleted();

    const userConsent = await this.container
      .get<StorageService>(storageModuleTypes.StorageService)
      .getUserConsent();

    const hasTrackingConsent = userConsent.isJust()
      ? userConsent.extract().consentGiven
      : undefined;

    this._contextService.onEvent({
      type: "initialize_context",
      context: {
        connectedDevice: undefined,
        selectedAccount: isTrustChainValid ? selectedAccount : undefined,
        trustChainId: isTrustChainValid ? trustChainId : undefined,
        applicationPath: undefined,
        chainId: chainId,
        welcomeScreenCompleted,
        hasTrackingConsent,
      },
    });
  }

  private listenDevice() {
    const deviceService = this.container.get<DeviceManagementKitService>(
      deviceModuleTypes.DeviceManagementKitService,
    );
    const dmk = deviceService.dmk;
    const sessionId = deviceService.connectedDevice?.sessionId;

    if (!sessionId) {
      return;
    }

    dmk
      .getDeviceSessionState({
        sessionId: sessionId as string,
      })
      .subscribe((state) => {
        if (state.deviceStatus === DeviceStatus.NOT_CONNECTED) {
          this._logger.info("Device disconnected");

          this._contextService.onEvent({
            type: "device_disconnected",
          });
        }
      });
  }

  async disconnect() {
    this._logger.debug("Disconnecting from device");
    await this.disconnectFromDevice();
    this.container
      .get<StorageService>(storageModuleTypes.StorageService)
      .resetStorage();

    this._contextService.onEvent({
      type: "wallet_disconnected",
    });

    try {
      await this.container.unbindAll();
    } catch (error) {
      this._logger.error("Error unbinding container", { error });
    } finally {
      this._logger.debug("Recreating container");
      this.container = createContainer(this.opts);
    }
  }

  // Device methods
  async connectToDevice(type: ConnectionType) {
    this._logger.debug("Connecting to device", { type });

    const device = await this.container
      .get<ConnectDevice>(deviceModuleTypes.ConnectDeviceUseCase)
      .execute({ type });

    this._contextService.onEvent({
      type: "device_connected",
      device: device,
    });

    this.listenDevice();
    return device;
  }

  async disconnectFromDevice() {
    this._logger.debug("Disconnecting from device");
    const result = await this.container
      .get<DisconnectDevice>(deviceModuleTypes.DisconnectDeviceUseCase)
      .execute();

    this._contextService.onEvent({
      type: "device_disconnected",
    });

    return result;
  }

  async getReferralUrl() {
    return this.container
      .get<DAppConfigService>(dAppConfigModuleTypes.DAppConfigService)
      .getDAppConfig()
      .then((res) => res.referralUrl);
  }

  async switchDevice(type: ConnectionType) {
    this._logger.debug("Switching device", { type });
    return this.container
      .get<SwitchDevice>(deviceModuleTypes.SwitchDeviceUseCase)
      .execute({ type });
  }

  // Account methods
  async fetchAccounts(): Promise<Account[]> {
    this._logger.debug("Fetching accounts");
    const accounts = this.container
      .get<FetchAccountsWithBalanceUseCase>(
        accountModuleTypes.FetchAccountsWithBalanceUseCase,
      )
      .execute();

    const accountsWithBalance: Account[] = await lastValueFrom(accounts);

    this.container
      .get<AccountService>(accountModuleTypes.AccountService)
      .setAccounts(accountsWithBalance);

    return accountsWithBalance;
  }

  /**
   * Fetches accounts with progressive balance loading.
   * Returns an Observable that emits:
   * - First: accounts with balance: undefined (accounts available, balances loading)
   * - Then: updated accounts as each balance loads
   * Use this for progressive UI updates with skeleton loading states.
   * Emits 'ledger-accounts-updated' event on window for UI reactivity.
   */
  fetchAccountsWithProgress(): Observable<Account[]> {
    this._logger.debug("Fetching accounts with progress");
    const accounts$ = this.container
      .get<FetchAccountsWithBalanceUseCase>(
        accountModuleTypes.FetchAccountsWithBalanceUseCase,
      )
      .execute();

    // Tap to update AccountService on each emission and emit event for UI reactivity
    return accounts$.pipe(
      tap((accounts) => {
        this.container
          .get<AccountService>(accountModuleTypes.AccountService)
          .setAccounts(accounts);

        // Emit event for UI components to react to account updates
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("ledger-accounts-updated", {
              detail: { accounts },
            }),
          );
        }
      }),
    );
  }

  getAccounts() {
    this._logger.debug("Getting accounts");
    return this.container
      .get<AccountService>(accountModuleTypes.AccountService)
      .getAccounts();
  }

  selectAccount(account: Account) {
    this._logger.debug("Selecting account", { account });
    this.container
      .get<AccountService>(accountModuleTypes.AccountService)
      .selectAccount(account);

    const selectedAccount = this.container
      .get<AccountService>(accountModuleTypes.AccountService)
      .getSelectedAccount();

    //SHOULD ALWAYS BE TRUE when use here.
    if (selectedAccount) {
      this._contextService.onEvent({
        type: "account_changed",
        account: selectedAccount,
      });

      this.container
        .get<TrackOnboarding>(eventTrackingModuleTypes.TrackOnboarding)
        .execute(selectedAccount);
    }
  }

  getSelectedAccount() {
    this._logger.debug("Getting selected account");
    // Use AccountService instead of StorageService to get full account data
    // including balance and tokens which are not persisted to storage
    const accountService = this.container.get<AccountService>(
      accountModuleTypes.AccountService,
    );
    return accountService.getSelectedAccount();
  }

  async getDetailedSelectedAccount() {
    this._logger.debug("Getting detailed selected account");
    return this.container
      .get<GetDetailedSelectedAccountUseCase>(
        accountModuleTypes.GetDetailedSelectedAccountUseCase,
      )
      .execute();
  }
  // Device methods
  getConnectedDevice() {
    this._logger.debug("Getting connected device");
    return this.container.get<DeviceManagementKitService>(
      deviceModuleTypes.DeviceManagementKitService,
    ).connectedDevice;
  }

  async listAvailableDevices() {
    this._logger.debug("Listing available devices");
    return this.container
      .get<ListAvailableDevices>(deviceModuleTypes.ListAvailableDevicesUseCase)
      .execute();
  }

  // Transaction methods
  sign(
    params:
      | SignTransactionParams
      | SignRawTransactionParams
      | SignTypedMessageParams
      | SignPersonalMessageParams,
  ): Observable<SignFlowStatus> {
    this._logger.debug("Signing transaction", { params });
    return this.container
      ?.get<TransactionService>(transactionModuleTypes.TransactionService)
      .sign(params);
  }

  setPendingTransactionParams(
    params: SignRawTransactionParams | SignTransactionParams | undefined,
  ) {
    this._logger.debug("Setting pending transaction params", { params });
    this._pendingTransactionParams = params;
  }

  getPendingTransactionParams():
    | SignRawTransactionParams
    | SignTransactionParams
    | undefined {
    this._logger.debug("Getting pending transaction params");
    return this._pendingTransactionParams;
  }

  setPendingAccountId(id: string | undefined) {
    this._logger.debug("Setting pending account id", { id });
    this._pendingAccountId = id;
  }

  getPendingAccountId(): string | undefined {
    this._logger.debug("Getting pending account address");
    return this._pendingAccountId;
  }

  clearPendingAccountId() {
    this._logger.debug("Clearing pending account id");
    this._pendingAccountId = undefined;
  }

  // Consent methods
  async hasConsent(): Promise<boolean> {
    this._logger.debug("Checking user consent");
    return await this.container
      .get<ConsentService>(consentModuleTypes.ConsentService)
      .hasConsent();
  }

  async hasRespondedToConsent(): Promise<boolean> {
    this._logger.debug("Checking if user has responded to consent");
    return await this.container
      .get<ConsentService>(consentModuleTypes.ConsentService)
      .hasRespondedToConsent();
  }

  async giveConsent(): Promise<void> {
    this._logger.debug("Giving user consent");
    await this.container
      .get<ConsentService>(consentModuleTypes.ConsentService)
      .giveConsent();
    this._contextService.onEvent({
      type: "tracking_consent_given",
    });
  }

  async refuseConsent(): Promise<void> {
    this._logger.debug("Refusing user consent");
    await this.container
      .get<ConsentService>(consentModuleTypes.ConsentService)
      .refuseConsent();
    this._contextService.onEvent({
      type: "tracking_consent_refused",
    });
  }

  async removeConsent(): Promise<void> {
    this._logger.debug("Removing user consent");
    await this.container
      .get<ConsentService>(consentModuleTypes.ConsentService)
      .removeConsent();
    this._contextService.onEvent({
      type: "tracking_consent_refused",
    });
  }

  async setWelcomeScreenCompleted(): Promise<void> {
    this._logger.debug("Setting welcome screen as completed");
    await this.container
      .get<StorageService>(storageModuleTypes.StorageService)
      .saveWelcomeScreenCompleted();
    this._contextService.onEvent({
      type: "welcome_screen_completed",
    });
  }

  isWelcomeScreenCompleted(): boolean {
    return this._contextService.getContext().welcomeScreenCompleted;
  }

  getTransactionService(): TransactionService {
    this._logger.debug("Getting transaction service");
    return this.container.get<TransactionService>(
      transactionModuleTypes.TransactionService,
    );
  }

  async jsonRpcRequest(args: JSONRPCRequest) {
    this._logger.debug("JSON RPC request", { args });
    return this.container
      .get<JSONRPCCallUseCase>(web3ProviderModuleTypes.JSONRPCCallUseCase)
      .execute(args);
  }

  getBackendService(): BackendService {
    this._logger.debug("Getting backend service");
    return this.container.get<BackendService>(
      backendModuleTypes.BackendService,
    );
  }

  connectToLedgerSync(): Observable<LedgerSyncAuthenticateResponse> {
    this._logger.debug("Connecting to ledger sync");

    this.container
      .get<TrackLedgerSyncOpened>(
        eventTrackingModuleTypes.TrackLedgerSyncOpened,
      )
      .execute();

    const res = this.container
      .get<LedgerSyncService>(ledgerSyncModuleTypes.LedgerSyncService)
      .authenticate();

    return res.pipe(
      tap(async (res: LedgerSyncAuthenticateResponse) => {
        if (!this.isAuthContext(res)) return;

        this._contextService.onEvent({
          type: "trustchain_connected",
          trustChainId: res.trustChainId,
          applicationPath: res.applicationPath,
        });

        //TODO move inside context service onEvent
        await this.container
          .get<TrackLedgerSyncActivated>(
            eventTrackingModuleTypes.TrackLedgerSyncActivated,
          )
          .execute();
      }),
    );
  }

  private isAuthContext(
    res: LedgerSyncAuthenticateResponse,
  ): res is AuthContext {
    return "trustChainId" in res && "applicationPath" in res;
  }

  observeContext(): Observable<ButtonCoreContext> {
    return this._contextService.observeContext();
  }

  // Config methods
  getConfig(): Config {
    return this.container.get<Config>(configModuleTypes.Config);
  }

  setLogLevel(logLevel: keyof typeof LOG_LEVELS) {
    this.container.get<Config>(configModuleTypes.Config).setLogLevel(logLevel);
  }

  isSupported() {
    return this.container
      .get<DeviceManagementKitService>(
        deviceModuleTypes.DeviceManagementKitService,
      )
      .dmk.isEnvironmentSupported();
  }

  setChainId(chainId: number) {
    this._contextService.onEvent({
      type: "chain_changed",
      chainId,
    });
  }

  getChainId(): number {
    return this._contextService.getContext().chainId;
  }

  async trackFloatingButtonClick(): Promise<void> {
    await this.container
      .get<TrackFloatingButtonClick>(
        eventTrackingModuleTypes.TrackFloatingButtonClick,
      )
      .execute();
  }

  async trackWalletActionClicked(
    walletAction: WalletActionType,
  ): Promise<void> {
    await this.container
      .get<TrackWalletAction>(eventTrackingModuleTypes.TrackWalletAction)
      .trackWalletActionClicked(walletAction);
  }

  async trackWalletRedirectConfirmed(
    walletAction: WalletActionType,
  ): Promise<void> {
    await this.container
      .get<TrackWalletAction>(eventTrackingModuleTypes.TrackWalletAction)
      .trackWalletRedirectConfirmed(walletAction);
  }

  async trackWalletRedirectCancelled(
    walletAction: WalletActionType,
  ): Promise<void> {
    await this.container
      .get<TrackWalletAction>(eventTrackingModuleTypes.TrackWalletAction)
      .trackWalletRedirectCancelled(walletAction);
  }
}
