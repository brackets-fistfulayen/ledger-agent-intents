import "../../atom/icon/ledger-icon.js";

import { consume } from "@lit/context";
import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { tailwindElement } from "../../../tailwind-element.js";

export type WalletTransactionFeature =
  | "send"
  | "receive"
  | "swap"
  | "buy"
  | "earn"
  | "sell";

export type WalletActionClickEventDetail = {
  action: WalletTransactionFeature;
  timestamp: number;
};

export interface LedgerWalletActionsAttributes {
  features?: WalletTransactionFeature[];
}

@customElement("ledger-wallet-actions")
@tailwindElement()
export class LedgerWalletActions extends LitElement {
  @property({ type: Array })
  features: WalletTransactionFeature[] = [];

  @consume({ context: langContext })
  @property({ attribute: false })
  public languages!: LanguageContext;

  private handleActionClick(action: WalletTransactionFeature) {
    this.dispatchEvent(
      new CustomEvent<WalletActionClickEventDetail>("wallet-action-click", {
        bubbles: true,
        composed: true,
        detail: {
          action,
          timestamp: Date.now(),
        },
      }),
    );
  }

  private getActionLabel(action: WalletTransactionFeature): string {
    const translations = this.languages?.currentTranslation;
    const labels: Record<WalletTransactionFeature, string> = {
      send: translations?.walletActions?.send ?? "Send",
      receive: translations?.walletActions?.receive ?? "Receive",
      swap: translations?.walletActions?.swap ?? "Swap",
      buy: translations?.walletActions?.buy ?? "Buy",
      earn: translations?.walletActions?.earn ?? "Earn",
      sell: translations?.walletActions?.sell ?? "Sell",
    };
    return labels[action];
  }

  private renderActionButton(action: WalletTransactionFeature) {
    return html`
      <button
        class="lb-flex lb-h-[59px] lb-shrink-0 lb-grow lb-basis-0 lb-flex-col lb-items-center lb-justify-center lb-gap-4 lb-rounded-md lb-bg-muted lb-px-8 lb-py-0 lb-text-white lb-transition lb-duration-150 lb-ease-in-out hover:lb-bg-muted-hover active:lb-bg-muted-pressed"
        @click=${() => this.handleActionClick(action)}
        aria-label=${this.getActionLabel(action)}
      >
        <div class="lb-h-20 lb-w-20 lb-shrink-0">
          <ledger-icon
            fillColor="white"
            type=${action}
            size="medium"
          ></ledger-icon>
        </div>
        <span
          class="lb-overflow-hidden lb-text-ellipsis lb-text-center lb-text-base lb-body-3"
          >${this.getActionLabel(action)}</span
        >
      </button>
    `;
  }

  private renderRow(actions: WalletTransactionFeature[]) {
    return html`
      <div class="lb-flex lb-flex-row lb-items-start lb-gap-12">
        ${actions.map((action) => this.renderActionButton(action))}
      </div>
    `;
  }

  override render() {
    if (!this.features || this.features.length === 0) {
      return nothing;
    }

    // For 6 actions, split into 2 rows of 3
    if (this.features.length >= 6) {
      const firstRow = this.features.slice(0, 3);
      const secondRow = this.features.slice(3, 6);
      return html`
        <div class="lb-flex lb-flex-col lb-gap-12">
          ${this.renderRow(firstRow)} ${this.renderRow(secondRow)}
        </div>
      `;
    }

    // For 2-5 actions, single row
    return this.renderRow(this.features);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-wallet-actions": LedgerWalletActions;
  }
}

export default LedgerWalletActions;
