import "../../atom/icon/ledger-icon.js";

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { tailwindElement } from "../../../tailwind-element.js";

const styles = css`
  :host {
    display: flex;
  }
`;

@customElement("ledger-account-switch")
@tailwindElement(styles)
export class LedgerAccountSwitch extends LitElement {
  @property({ type: Object })
  account?: {
    id: string;
    currencyId: string;
    freshAddress: string;
    seedIdentifier: string;
    derivationMode: string;
    index: number;
    name: string;
  };

  private handleClick = () => {
    this.dispatchEvent(
      new CustomEvent("account-switch", {
        bubbles: true,
        composed: true,
        detail: {
          account: this.account,
        },
      }),
    );
  };

  private formatAddress(address: string) {
    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  override render() {
    if (!this.account) {
      return;
    }

    return html`
      <button
        class="lb-flex lb-h-48 lb-max-w-full lb-cursor-pointer lb-flex-col lb-rounded-sm lb-p-4 lb-text-left hover:lb-bg-muted-hover active:lb-bg-muted-pressed"
        @click=${this.handleClick}
      >
        <div class="lb-flex lb-items-center lb-gap-4">
          <div
            class="lb-flex lb-min-w-0 lb-flex-1 lb-truncate lb-text-base lb-body-2-semi-bold"
          >
            <span class="body-2-semi-bold lb-text-base"
              >${this.account.name}</span
            >
          </div>
          <ledger-icon
            class="lb-shrink-0"
            type="chevronDown"
            size="medium"
          ></ledger-icon>
        </div>
        <span
          class="lb-grow lb-basis-80 lb-overflow-hidden lb-text-ellipsis lb-text-nowrap lb-text-muted lb-body-3"
        >
          ${this.formatAddress(this.account.freshAddress)}
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-account-switch": LedgerAccountSwitch;
  }

  interface WindowEventMap {
    "account-switch": CustomEvent<{
      account: LedgerAccountSwitch["account"];
    }>;
  }
}
