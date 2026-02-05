import { Account } from "@ledgerhq/ledger-wallet-provider-core";
import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { html as staticHtml, unsafeStatic } from "lit/static-html.js";

import {
  LedgerModal,
  ModalMode,
} from "../components/atom/modal/ledger-modal.js";
import type { WalletTransactionFeature } from "../components/molecule/wallet-actions/ledger-wallet-actions.js";
import { CoreContext, coreContext } from "../context/core-context.js";
import { langContext, LanguageContext } from "../context/language-context.js";
import { RootNavigationController } from "./root-navigation-controller.js";
import { Destination } from "./routes.js";

@customElement("root-navigation-component")
export class RootNavigationComponent extends LitElement {
  @consume({ context: coreContext })
  public coreContext!: CoreContext;

  @consume({ context: langContext })
  @property({ attribute: false })
  public languageContext!: LanguageContext;

  @property({ type: Array })
  walletTransactionFeatures?: WalletTransactionFeature[];

  @query("#ledger-modal")
  private ledgerModal!: LedgerModal;

  @query("#modal-content")
  private modalContent!: HTMLElement;

  rootNavigationController!: RootNavigationController;

  isModalOpen = false;

  override connectedCallback() {
    super.connectedCallback();
    this.rootNavigationController = new RootNavigationController(
      this,
      this.coreContext,
      this.languageContext.currentTranslation,
      this.modalContent,
    );
  }

  // PUBLIC METHODS
  public openModal(mode: ModalMode = "center") {
    this.ledgerModal.openModal(mode);
    this.isModalOpen = true;
  }

  public closeModal() {
    this.ledgerModal.closeModal();
    window.dispatchEvent(
      new CustomEvent("ledger-provider-close", {
        bubbles: true,
        composed: true,
      }),
    );
    this.isModalOpen = false;
  }

  public selectAccount(account: Account) {
    this.rootNavigationController.selectAccount(account);
  }

  public getSelectedAccount() {
    return this.rootNavigationController.selectedAccount;
  }

  public getModalMode(): ModalMode {
    return this.ledgerModal.mode;
  }

  public navigateToHome() {
    this.rootNavigationController.navigation.navigateTo(
      this.rootNavigationController.destinations.home,
    );
  }

  public navigationIntent(
    intent: Destination["name"],
    params?: unknown,
    mode?: ModalMode,
  ) {
    this.rootNavigationController.navigationIntent(intent, params);
    this.openModal(mode ?? "center");
  }

  // PRIVATE METHODS
  private handleModalOpen() {
    this.rootNavigationController.handleModalOpen();
    window.dispatchEvent(
      new CustomEvent("ledger-core-modal-open", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleModalClose() {
    window.dispatchEvent(
      new CustomEvent("ledger-provider-close", {
        bubbles: true,
        composed: true,
      }),
    );

    window.dispatchEvent(
      new CustomEvent("ledger-core-modal-close", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleModalAnimationComplete() {
    this.rootNavigationController.handleModalClose();
  }

  private handleChipClick(_e: CustomEvent) {
    this.rootNavigationController.handleChipClick();
  }

  private handleSettingsClick() {
    this.rootNavigationController.navigateToSettings();
  }

  private goBack() {
    this.rootNavigationController.navigateBack();
  }

  private renderScreen() {
    const currentScreen = this.rootNavigationController.currentScreen;

    const tag = unsafeStatic(currentScreen?.component ?? "ledger-button-404");

    if (currentScreen) {
      return staticHtml`
        <${tag}
          .destinations=${this.rootNavigationController.destinations}
          .navigation=${this.rootNavigationController.navigation}
          .params=${this.rootNavigationController.params}
          .walletTransactionFeatures=${this.walletTransactionFeatures}
        ></${tag}>
      `;
    }

    return html`<ledger-button-404 id="not-found"></ledger-button-404>`;
  }

  override render() {
    //const connectedDevice = this.coreContext.getConnectedDevice();
    const canGoBack =
      this.rootNavigationController.currentScreen?.canGoBack ?? false;

    const canClose =
      this.rootNavigationController.currentScreen?.toolbar.canClose ?? true;

    const title = this.rootNavigationController.currentScreen?.toolbar.title;
    //      connectedDevice &&
    //    this.rootNavigationController.currentScreen?.name === "home-flow"
    //    ? connectedDevice.name
    //  : this.rootNavigationController.currentScreen?.toolbar.title ;

    const deviceModelId = undefined; //TODO: uncomment this once we have the switch device flow working properly
    // connectedDevice &&
    // this.rootNavigationController.currentScreen?.name === "home-flow"
    //   ? connectedDevice.modelId
    //   : undefined;

    const showSettings =
      this.rootNavigationController.currentScreen?.name === "home-flow";

    return html`
      <ledger-modal
        id="ledger-modal"
        @modal-opened=${this.handleModalOpen}
        @modal-closed=${this.handleModalClose}
        @modal-animation-complete=${this.handleModalAnimationComplete}
      >
        <div slot="toolbar">
          <ledger-toolbar
            title=${ifDefined(title)}
            aria-label=${ifDefined(title)}
            .canGoBack=${canGoBack}
            .canClose=${canClose}
            .showSettings=${showSettings}
            deviceModelId=${ifDefined(deviceModelId)}
            @ledger-toolbar-close=${this.closeModal}
            @ledger-toolbar-go-back-click=${this.goBack}
            @ledger-toolbar-chip-click=${this.handleChipClick}
            @ledger-toolbar-settings-click=${this.handleSettingsClick}
          >
          </ledger-toolbar>
        </div>
        <div id="modal-content" style="height: 100%">
          ${this.renderScreen()}
        </div>
      </ledger-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "root-navigation-component": RootNavigationComponent;
  }

  interface WindowEventMap {
    "ledger-provider-close": CustomEvent;
    "ledger-core-modal-open": CustomEvent;
    "ledger-core-modal-close": CustomEvent;
  }
}
