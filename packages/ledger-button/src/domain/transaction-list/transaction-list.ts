import "../../components/index.js";
import "../../components/atom/skeleton/ledger-skeleton.js";

import { TransactionHistoryItem } from "@ledgerhq/ledger-wallet-provider-core";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { tailwindElement } from "../../tailwind-element.js";

@customElement("transaction-list-screen")
@tailwindElement()
export class TransactionListScreen extends LitElement {
  @property({ attribute: false })
  transactions: TransactionHistoryItem[] | undefined = undefined;

  private get isLoading(): boolean {
    return this.transactions === undefined;
  }

  private formatDate(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return timestamp;
    }
  }

  private formatHash(hash: string): string {
    if (!hash || hash.length <= 10) {
      return hash;
    }
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
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
            <div class="lb-h-16 lb-w-80 lb-rounded-sm">
              <ledger-skeleton></ledger-skeleton>
            </div>
            <div class="lb-h-12 lb-w-56 lb-rounded-sm">
              <ledger-skeleton></ledger-skeleton>
            </div>
          </div>
        </div>
        <div class="lb-flex lb-flex-col lb-items-end lb-gap-4">
          <div class="lb-h-16 lb-w-48 lb-rounded-sm">
            <ledger-skeleton></ledger-skeleton>
          </div>
          <div class="lb-h-12 lb-w-32 lb-rounded-sm">
            <ledger-skeleton></ledger-skeleton>
          </div>
        </div>
      </div>
    `;
  }

  private renderSkeletonList() {
    return html`
      <div class="lb-flex lb-flex-col lb-gap-8">
        ${this.renderSkeletonItem()} ${this.renderSkeletonItem()}
        ${this.renderSkeletonItem()} ${this.renderSkeletonItem()}
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div
        class="lb-flex lb-flex-col lb-items-center lb-justify-center lb-py-32"
      >
        <span class="lb-text-muted lb-body-2">No transactions found</span>
      </div>
    `;
  }

  private renderTransactionItem(tx: TransactionHistoryItem) {
    const isSent = tx.type === "sent";
    const icon = isSent ? "↑" : "↓";
    const iconBgClass = isSent ? "lb-bg-error" : "lb-bg-success";
    const label = isSent ? "Sent" : "Received";
    const valuePrefix = isSent ? "-" : "+";

    return html`
      <div
        class="lb-flex lb-items-center lb-justify-between lb-rounded-md lb-bg-muted lb-p-12"
      >
        <div class="lb-flex lb-items-center lb-gap-12">
          <div
            class="lb-flex lb-h-32 lb-w-32 lb-items-center lb-justify-center lb-rounded-full ${iconBgClass}"
          >
            <span class="lb-text-on-accent lb-body-2-semi-bold">${icon}</span>
          </div>
          <div class="lb-flex lb-flex-col">
            <span class="lb-text-base lb-body-2-semi-bold">${label}</span>
            <span class="lb-text-muted lb-body-3"
              >${this.formatHash(tx.hash)}</span
            >
          </div>
        </div>
        <div class="lb-flex lb-flex-col lb-items-end">
          <span class="lb-text-base lb-body-2-semi-bold"
            >${valuePrefix}${tx.value}</span
          >
          <span class="lb-text-muted lb-body-3"
            >${this.formatDate(tx.timestamp)}</span
          >
        </div>
      </div>
    `;
  }

  private renderTransactionList() {
    if (!this.transactions || this.transactions.length === 0) {
      return this.renderEmptyState();
    }

    return html`
      <div class="lb-flex lb-flex-col lb-gap-8">
        ${this.transactions.map((tx) => this.renderTransactionItem(tx))}
      </div>
    `;
  }

  override render() {
    return html`
      <div class="lb-flex lb-flex-col">
        ${this.isLoading
          ? this.renderSkeletonList()
          : this.renderTransactionList()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "transaction-list-screen": TransactionListScreen;
  }
}
