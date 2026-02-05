import "../../components/index.js";
import "../token-list/token-list.js";
import "../transaction-list/transaction-list.js";

import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { TabChangeEventDetail } from "../../components/atom/tabs/ledger-tabs.js";
import type { AccountItemClickEventDetail } from "../../components/molecule/account-item/ledger-account-item.js";
import type {
  WalletActionClickEventDetail,
  WalletTransactionFeature,
} from "../../components/molecule/wallet-actions/ledger-wallet-actions.js";
import type {
  WalletRedirectCancelEventDetail,
  WalletRedirectConfirmEventDetail,
} from "../../components/molecule/wallet-redirect-drawer/ledger-wallet-redirect-drawer.js";
import { CoreContext, coreContext } from "../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../context/language-context.js";
import { buildWalletActionDeepLink } from "../../shared/constants/deeplinks.js";
import { Navigation } from "../../shared/navigation.js";
import { Destinations } from "../../shared/routes.js";
import { tailwindElement } from "../../tailwind-element.js";
import { LedgerHomeController } from "./ledger-home-controller.js";

// Map chain tickers to their native token ticker
// EVM L2s use ETH as native token, not the chain ticker
const CHAIN_TO_NATIVE_TICKER: Record<string, string> = {
  BASE: "ETH",
  ARB: "ETH",
  OP: "ETH",
  LINEA: "ETH",
  SCROLL: "ETH",
  BLAST: "ETH",
  ZKSYNC: "ETH",
  // Add more as needed
};

function getNativeTicker(ticker: string): string {
  return CHAIN_TO_NATIVE_TICKER[ticker.toUpperCase()] ?? ticker;
}

const styles = css`
  :host {
    display: block;
    height: 100%;
  }

  .animation {
    position: relative;
  }

  .animation::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      0deg,
      rgba(21, 21, 21, 0) 0%,
      var(--background-canvas-sheet) 100%
    );
  }
`;

@customElement("ledger-home-screen")
@tailwindElement(styles)
export class LedgerHomeScreen extends LitElement {
  @property({ type: Object })
  navigation!: Navigation;

  @property({ type: Object })
  destinations!: Destinations;

  @property({ type: Array })
  walletTransactionFeatures?: WalletTransactionFeature[];

  @consume({ context: coreContext })
  @property({ attribute: false })
  public coreContext!: CoreContext;

  @consume({ context: langContext })
  @property({ attribute: false })
  public languages!: LanguageContext;

  @state()
  private activeTab = "tokens";

  @state()
  private showRedirectDrawer = false;

  @state()
  private currentAction: WalletTransactionFeature | null = null;

  controller!: LedgerHomeController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new LedgerHomeController(
      this,
      this.coreContext,
      this.navigation,
      this.destinations,
    );
  }

  private handleAccountItemClick = (
    event: CustomEvent<AccountItemClickEventDetail>,
  ) => {
    this.dispatchEvent(
      new CustomEvent("ledger-internal-account-switch", {
        bubbles: true,
        composed: true,
        detail: event.detail,
      }),
    );
  };

  private handleDisconnectClick = async () => {
    this.dispatchEvent(
      new CustomEvent("ledger-internal-button-disconnect", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleTabChange = (event: CustomEvent<TabChangeEventDetail>) => {
    this.activeTab = event.detail.selectedId;
  };

  private handleWalletActionClick = (
    event: CustomEvent<WalletActionClickEventDetail>,
  ) => {
    const action = event.detail.action;
    this.currentAction = action;
    this.showRedirectDrawer = true;

    void this.coreContext.trackWalletActionClicked(action);
  };

  private handleRedirectConfirm = (
    event: CustomEvent<WalletRedirectConfirmEventDetail>,
  ) => {
    const action = event.detail.action;

    void this.coreContext.trackWalletRedirectConfirmed(action);

    const deeplink = buildWalletActionDeepLink(action, {
      currency: this.controller.selectedAccount?.currencyId,
    });
    window.open(deeplink, "_blank", "noopener,noreferrer");

    this.showRedirectDrawer = false;
    this.currentAction = null;
  };

  private handleRedirectCancel = (
    event: CustomEvent<WalletRedirectCancelEventDetail>,
  ) => {
    const action = event.detail.action;

    void this.coreContext.trackWalletRedirectCancelled(action);

    this.showRedirectDrawer = false;
    this.currentAction = null;
  };

  override render() {
    if (this.controller.loading) {
      return html`
        <div class="lb-h-full lb-min-h-full lb-overflow-hidden">
          <ledger-lottie
            class="animation lb-overflow-hidden"
            animationName="backgroundFlare"
            .autoplay=${true}
            .loop=${true}
            size="full"
          ></ledger-lottie>
        </div>
      `;
    }
    const account = this.controller.selectedAccount;

    if (!account) {
      this.navigation.navigateTo(this.destinations.onboardingFlow);
      return;
    }

    const lang = this.languages.currentTranslation;

    return html`
      <div class="lb-relative lb-h-full">
        <div
          class="lb-flex lb-flex-col lb-items-stretch lb-gap-24 lb-p-24 lb-pt-0"
        >
          <div
            class="lb-flex lb-flex-col lb-gap-32 lb-rounded-md lb-bg-muted lb-p-16"
          >
            <div class="lb-flex lb-flex-row lb-items-center lb-justify-between">
              <ledger-account-switch
                .account=${account}
                @account-switch=${this.handleAccountItemClick}
              ></ledger-account-switch>

              <ledger-crypto-icon
                .ledgerId=${account.currencyId}
                size="small"
                variant="square"
              ></ledger-crypto-icon>
            </div>

            <div class="lb-flex lb-flex-row lb-items-center lb-justify-between">
              <ledger-balance
                label=${lang.home.balance}
                .balance=${account.balance}
                .ticker=${getNativeTicker(account.ticker)}
              ></ledger-balance>
            </div>
          </div>

          <ledger-wallet-actions
            .features=${this.walletTransactionFeatures}
            @wallet-action-click=${this.handleWalletActionClick}
          ></ledger-wallet-actions>

          <ledger-tabs
            .tabs=${[
              { id: "tokens", label: "Tokens" },
              { id: "transactions", label: "Transactions" },
            ]}
            .selectedId=${this.activeTab}
            @tab-change=${this.handleTabChange}
          ></ledger-tabs>

          ${this.activeTab === "tokens"
            ? html`<token-list-screen></token-list-screen>`
            : html`<transaction-list-screen
                .transactions=${this.controller.selectedAccount?.transactionHistory}
              ></transaction-list-screen>`}

          <ledger-button
            variant="secondary"
            size="full"
            label=${lang.common.button.disconnect}
            @click=${this.handleDisconnectClick}
          ></ledger-button>
        </div>

        ${this.showRedirectDrawer && this.currentAction
          ? html`
              <ledger-wallet-redirect-drawer
                .action=${this.currentAction}
                @wallet-redirect-confirm=${this.handleRedirectConfirm}
                @wallet-redirect-cancel=${this.handleRedirectCancel}
              ></ledger-wallet-redirect-drawer>
            `
          : ""}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-home-screen": LedgerHomeScreen;
  }

  interface WindowEventMap {
    "ledger-internal-button-disconnect": CustomEvent<void>;
    "ledger-internal-account-switch": CustomEvent<AccountItemClickEventDetail>;
  }
}
