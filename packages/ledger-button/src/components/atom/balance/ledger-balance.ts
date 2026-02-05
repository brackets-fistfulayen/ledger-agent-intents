import "../skeleton/ledger-skeleton.js";

import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { tailwindElement } from "../../../tailwind-element.js";

@customElement("ledger-balance")
@tailwindElement()
export class LedgerBalance extends LitElement {
  @property({ type: String })
  label = "Balance";

  @property({ attribute: false })
  balance: number | string | undefined | null = undefined;

  @property({ type: String })
  ticker = "";

  private get isLoading(): boolean {
    // Loading if balance is undefined, null, or empty string
    return (
      this.balance === undefined ||
      this.balance === null ||
      this.balance === ""
    );
  }

  override render() {
    return html`
      <div class="lb-flex lb-flex-col">
        <span class="lb-self-stretch lb-text-muted lb-body-3"
          >${this.label}</span
        >
        ${this.isLoading
          ? html`<div class="lb-h-20 lb-w-80 lb-rounded-sm">
              <ledger-skeleton></ledger-skeleton>
            </div>`
          : html`<span class="lb-self-stretch lb-text-base lb-body-2-semi-bold">
              ${this.balance} ${this.ticker}
            </span>`}
      </div>
    `;
  }
}
