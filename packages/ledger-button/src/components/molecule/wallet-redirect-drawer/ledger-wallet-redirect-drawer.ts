import "../../atom/button/ledger-button.js";
import "../../atom/drawer/ledger-drawer.js";
import "../../atom/icon/ledger-icon.js";

import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { LEDGER_WALLET_DOWNLOAD_URL } from "../../../shared/constants/deeplinks.js";
import { tailwindElement } from "../../../tailwind-element.js";
import type { LedgerDrawer } from "../../atom/drawer/ledger-drawer.js";
import type { WalletTransactionFeature } from "../wallet-actions/ledger-wallet-actions.js";

export type WalletRedirectConfirmEventDetail = {
  action: WalletTransactionFeature;
  timestamp: number;
};

export type WalletRedirectCancelEventDetail = {
  action: WalletTransactionFeature;
  timestamp: number;
};

export interface LedgerWalletRedirectDrawerAttributes {
  action: WalletTransactionFeature;
}

@customElement("ledger-wallet-redirect-drawer")
@tailwindElement()
export class LedgerWalletRedirectDrawer extends LitElement {
  @property({ type: String })
  action: WalletTransactionFeature = "send";

  @consume({ context: langContext })
  @property({ attribute: false })
  public languages!: LanguageContext;

  @query("ledger-drawer")
  private drawerElement!: LedgerDrawer;

  private async handleConfirm() {
    await this.drawerElement.close();

    this.dispatchEvent(
      new CustomEvent<WalletRedirectConfirmEventDetail>(
        "wallet-redirect-confirm",
        {
          bubbles: true,
          composed: true,
          detail: {
            action: this.action,
            timestamp: Date.now(),
          },
        },
      ),
    );
  }

  private handleDrawerClose() {
    this.dispatchEvent(
      new CustomEvent<WalletRedirectCancelEventDetail>(
        "wallet-redirect-cancel",
        {
          bubbles: true,
          composed: true,
          detail: {
            action: this.action,
            timestamp: Date.now(),
          },
        },
      ),
    );
  }

  private handleDownload() {
    window.open(LEDGER_WALLET_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
  }

  override render() {
    const translations = this.languages?.currentTranslation;
    const title =
      translations?.walletRedirect?.title ?? "Continue in Ledger Wallet";
    const description =
      translations?.walletRedirect?.description ??
      "You need the Ledger Wallet desktop app to complete this action.";
    const confirmLabel =
      translations?.walletRedirect?.confirm ?? "Open Ledger Wallet";
    const downloadLabel =
      translations?.walletRedirect?.download ?? "Download Ledger Wallet";

    return html`
      <ledger-drawer @drawer-close=${this.handleDrawerClose}>
        <div
          class="lb-flex lb-flex-col lb-items-center lb-gap-32 lb-text-center"
        >
          <div
            class="lb-flex lb-h-64 lb-w-64 lb-items-center lb-justify-center lb-rounded-full lb-bg-muted-transparent"
          >
            <ledger-icon
              type="info"
              size="large"
              fillColor="white"
            ></ledger-icon>
          </div>

          <div class="lb-flex lb-flex-col lb-gap-12">
            <h3 class="lb-font-semibold lb-text-base lb-heading-4">${title}</h3>
            <p class="lb-text-muted lb-opacity-60 lb-body-1">${description}</p>
          </div>

          <div class="lb-flex lb-w-full lb-flex-col lb-gap-12">
            <ledger-button
              variant="primary"
              size="full"
              label=${confirmLabel}
              @click=${this.handleConfirm}
            ></ledger-button>
            <ledger-button
              variant="secondary"
              size="full"
              label=${downloadLabel}
              @click=${this.handleDownload}
            ></ledger-button>
          </div>
        </div>
      </ledger-drawer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-wallet-redirect-drawer": LedgerWalletRedirectDrawer;
  }

  interface WindowEventMap {
    "wallet-redirect-confirm": CustomEvent<WalletRedirectConfirmEventDetail>;
    "wallet-redirect-cancel": CustomEvent<WalletRedirectCancelEventDetail>;
  }
}

export default LedgerWalletRedirectDrawer;
