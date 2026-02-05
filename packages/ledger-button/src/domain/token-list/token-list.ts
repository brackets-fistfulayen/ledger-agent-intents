import "../../components/index.js";
import "../../components/atom/skeleton/ledger-skeleton.js";

import { Account } from "@ledgerhq/ledger-wallet-provider-core";
import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CoreContext, coreContext } from "../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../context/language-context.js";
import { tailwindElement } from "../../tailwind-element.js";

@customElement("token-list-screen")
@tailwindElement()
export class TokenListScreen extends LitElement {
  @consume({ context: coreContext })
  @property({ attribute: false })
  public coreContext!: CoreContext;

  @consume({ context: langContext })
  @property({ attribute: false })
  public languages!: LanguageContext;

  override connectedCallback() {
    super.connectedCallback();
    // Listen for account updates
    window.addEventListener(
      "ledger-accounts-updated",
      this.handleAccountsUpdated,
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "ledger-accounts-updated",
      this.handleAccountsUpdated,
    );
  }

  private handleAccountsUpdated = () => {
    this.requestUpdate();
  };

  private get selectedAccount(): Account | undefined {
    return this.coreContext?.getSelectedAccount();
  }

  // Compute loading state directly from current data - no state variable needed
  private get isLoading(): boolean {
    const balance = this.selectedAccount?.balance;
    // Loading if no account or balance not yet loaded
    return !this.selectedAccount || balance === undefined || balance === null || balance === "";
  }

  private get tokens() {
    return this.selectedAccount?.tokens ?? [];
  }

  private renderSkeletonItem() {
    return html`
      <div
        class="lb-flex lb-items-center lb-justify-between lb-rounded-md lb-bg-muted lb-p-12"
      >
        <div class="lb-flex lb-items-center lb-gap-12">
          <div class="lb-h-32 lb-w-32 lb-rounded-full">
            <ledger-skeleton></ledger-skeleton>
          </div>
          <div class="lb-flex lb-flex-col lb-gap-4">
            <div class="lb-h-16 lb-w-64 lb-rounded-sm">
              <ledger-skeleton></ledger-skeleton>
            </div>
            <div class="lb-h-12 lb-w-40 lb-rounded-sm">
              <ledger-skeleton></ledger-skeleton>
            </div>
          </div>
        </div>
        <div class="lb-h-16 lb-w-48 lb-rounded-sm">
          <ledger-skeleton></ledger-skeleton>
        </div>
      </div>
    `;
  }

  private renderSkeletonList() {
    return html`
      <div class="lb-flex lb-flex-col lb-gap-8">
        ${this.renderSkeletonItem()} ${this.renderSkeletonItem()}
        ${this.renderSkeletonItem()}
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div
        class="lb-flex lb-flex-col lb-items-center lb-justify-center lb-py-32"
      >
        <span class="lb-text-muted lb-body-2">No tokens found</span>
      </div>
    `;
  }

  private renderTokenList() {
    if (this.tokens.length === 0) {
      return this.renderEmptyState();
    }

    return html`
      <div class="lb-flex lb-flex-col lb-gap-8">
        ${this.tokens.map(
          (token) => html`
            <div
              class="lb-flex lb-items-center lb-justify-between lb-rounded-md lb-bg-muted lb-p-12"
            >
              <div class="lb-flex lb-items-center lb-gap-12">
                <ledger-crypto-icon
                  .ledgerId=${token.ledgerId ?? ""}
                  size="small"
                  variant="circle"
                ></ledger-crypto-icon>
                <div class="lb-flex lb-flex-col">
                  <span class="lb-text-base lb-body-2-semi-bold"
                    >${token.ticker}</span
                  >
                  <span class="lb-text-muted lb-body-3"
                    >${token.name ?? token.ticker}</span
                  >
                </div>
              </div>
              <span class="lb-text-base lb-body-2-semi-bold">
                ${token.balance} ${token.ticker}
              </span>
            </div>
          `,
        )}
      </div>
    `;
  }

  override render() {
    return html`
      <div class="lb-flex lb-flex-col">
        ${this.isLoading ? this.renderSkeletonList() : this.renderTokenList()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "token-list-screen": TokenListScreen;
  }
}
