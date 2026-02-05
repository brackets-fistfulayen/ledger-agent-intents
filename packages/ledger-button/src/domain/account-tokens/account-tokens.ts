import "../../components/index.js";

import { Account, Token } from "@ledgerhq/ledger-wallet-provider-core";
import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CoreContext, coreContext } from "../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../context/language-context.js";
import { Navigation } from "../../shared/navigation.js";
import { tailwindElement } from "../../tailwind-element.js";
import { AccountTokenController } from "./account-token-controller.js";

@customElement("account-tokens-screen")
@tailwindElement()
export class AccountTokensScreen extends LitElement {
  @property({ type: Object })
  navigation!: Navigation;

  controller!: AccountTokenController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new AccountTokenController(
      this,
      this.coreContext,
      this.navigation,
    );
  }

  @consume({ context: coreContext })
  @property({ attribute: false })
  public coreContext!: CoreContext;

  @consume({ context: langContext })
  @property({ attribute: false })
  public languages!: LanguageContext;

  private formatAddress(address: string): string {
    if (!address || address.length <= 8) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private renderTokenItem = (token: Token) => {
    return html`
      <ledger-chain-item
        ledger-id=${token.ticker}
        .title=${token.name}
        .subtitle=${token.ticker}
        .ticker=${token.ticker}
        .value=${token.balance}
        .isClickable=${false}
        type="token"
      ></ledger-chain-item>
    `;
  };

  private renderConnectButton() {
    const translations = this.languages.currentTranslation;

    return html`
      <div
        class="lb-sticky lb-bottom-0 lb-rounded-2xl lb-bg-canvas-sheet lb-p-24 lb-pt-0"
      >
        <ledger-button
          variant="primary"
          size="full"
          .label=${translations.common.connect}
          @ledger-button-click=${this.controller.handleConnect}
        ></ledger-button>
      </div>
    `;
  }

  override render() {
    const translations = this.languages.currentTranslation;

    if (!this.controller.account) {
      return html`
        <div class="lb-flex lb-h-full lb-items-center lb-justify-center">
          <span class="lb-text-muted lb-body-2">Account not found</span>
        </div>
      `;
    }

    return html`
      <div class="lb-relative lb-flex lb-h-full lb-flex-col">
        <div
          class="lb-sticky lb-top-0 lb-flex lb-flex-col lb-gap-4 lb-border-b lb-border-muted-subtle lb-bg-canvas-sheet lb-p-12"
          style="z-index: 100;"
        >
          <div class="lb-flex lb-items-center lb-gap-12">
            <ledger-crypto-icon
              ledger-id=${this.controller.account.currencyId}
              variant="square"
              size="large"
            ></ledger-crypto-icon>
            <div class="lb-flex lb-flex-col lb-gap-4">
              <span class="lb-text-lg lb-body-1-semi-bold"
                >${this.controller.account.name}</span
              >
              <span class="lb-text-muted lb-body-3"
                >${this.formatAddress(
                  this.controller.account.freshAddress,
                )}</span
              >
            </div>
          </div>
        </div>

        <div class="lb-h-full lb-overflow-y-auto lb-p-24">
          <div class="lb-flex lb-flex-col lb-gap-12">
            ${this.controller.account.tokens.length > 0
              ? this.controller.account.tokens.map(this.renderTokenItem)
              : html`
                  <div
                    class="lb-flex lb-flex-col lb-items-center lb-justify-center lb-py-48 lb-text-center"
                  >
                    <span class="lb-text-muted lb-body-2">
                      ${translations.accountTokens?.noTokens ||
                      "No tokens found for this account"}
                    </span>
                  </div>
                `}
          </div>
        </div>

        ${this.renderConnectButton()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "account-tokens-screen": AccountTokensScreen;
  }
  interface WindowEventMap {
    "ledger-internal-account-selected": CustomEvent<
      | {
          account: Account;
          status: "success";
        }
      | {
          status: "error";
          error: unknown;
        }
    >;
  }
}
