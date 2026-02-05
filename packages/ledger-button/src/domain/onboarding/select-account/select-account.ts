import "../../../components/index.js";

import { Account } from "@ledgerhq/ledger-wallet-provider-core";
import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CoreContext, coreContext } from "../../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { tailwindElement } from "../../../tailwind-element.js";
import { SelectAccountController } from "./select-account-controller.js";

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
};

function getNativeTicker(ticker: string): string {
  return CHAIN_TO_NATIVE_TICKER[ticker.toUpperCase()] ?? ticker;
}

@customElement("select-account-screen")
@tailwindElement()
export class SelectAccountScreen extends LitElement {
  @property({ type: Object })
  navigation!: Navigation;

  @consume({ context: coreContext })
  @property({ attribute: false })
  public coreContext!: CoreContext;

  @consume({ context: langContext })
  @property({ attribute: false })
  public languages!: LanguageContext;

  controller!: SelectAccountController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new SelectAccountController(
      this,
      this.coreContext,
      this.navigation,
    );
  }

  renderAccountItem = (account: Account) => {
    const translations = this.languages.currentTranslation;

    // NOTE: The label should be displayed only if the account has tokens
    // Pass balance as-is (undefined shows skeleton, value shows balance)
    // Use getNativeTicker to show ETH for L2 chains instead of chain ticker
    return html`
      <ledger-account-item
        .title=${account.name}
        .address=${account.freshAddress}
        .linkLabel=${translations.onboarding.selectAccount.showTokens}
        .ledgerId=${account.id}
        .ticker=${getNativeTicker(account.ticker)}
        .balance=${account.balance}
        .tokens=${account.tokens?.length ?? 0}
        .currencyId=${account.currencyId}
        @account-item-click=${this.controller.handleAccountItemClick}
        @account-item-show-tokens-click=${this.controller
          .handleAccountItemShowTokensClick}
      ></ledger-account-item>
    `;
  };

  override render() {
    return html`
      <div class="lb-flex lb-flex-col lb-gap-12 lb-p-24 lb-pt-0">
        ${this.controller.accounts.map(this.renderAccountItem)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "select-account-screen": SelectAccountScreen;
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
