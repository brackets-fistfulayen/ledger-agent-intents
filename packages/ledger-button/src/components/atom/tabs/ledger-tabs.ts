import { cva } from "class-variance-authority";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { tailwindElement } from "../../../tailwind-element.js";

export type TabItem = {
  id: string;
  label: string;
};

export type TabChangeEventDetail = {
  selectedId: string;
  previousId: string;
  timestamp: number;
};

export interface LedgerTabsAttributes {
  tabs?: TabItem[];
  selectedId?: string;
}

const containerVariants = cva([
  "lb-flex lb-w-full lb-gap-4 lb-rounded-md lb-border lb-border-muted-subtle lb-p-4",
]);

const tabVariants = cva(
  [
    "body-2-semi-bold lb-align-self-stretch lb-flex lb-h-40 lb-flex-1 lb-flex-shrink-0 lb-cursor-pointer lb-items-center lb-justify-center lb-rounded-sm lb-px-4 lb-py-8 lb-transition-all lb-duration-200 lb-ease-in-out lb-body-2-semi-bold",
  ],
  {
    variants: {
      selected: {
        true: ["lb-bg-muted lb-text-base"],
        false: [
          "lb-bg-transparent lb-text-muted hover:lb-bg-muted-transparent-hover",
        ],
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

const styles = css`
  :host {
    display: block;
  }
`;

@customElement("ledger-tabs")
@tailwindElement(styles)
export class LedgerTabs extends LitElement {
  @property({ attribute: false })
  tabs: TabItem[] = [];

  @property({ attribute: false })
  selectedId = "";

  private handleTabClick(tab: TabItem) {
    if (tab.id === this.selectedId) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<TabChangeEventDetail>("tab-change", {
        bubbles: true,
        composed: true,
        detail: {
          selectedId: tab.id,
          previousId: this.selectedId,
          timestamp: Date.now(),
        },
      }),
    );
  }

  private handleKeydown(event: KeyboardEvent, tab: TabItem) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleTabClick(tab);
    }
  }

  private renderTab(tab: TabItem) {
    const isSelected = tab.id === this.selectedId;

    return html`
      <button
        class=${tabVariants({ selected: isSelected })}
        role="tab"
        aria-selected=${isSelected}
        tabindex=${isSelected ? 0 : -1}
        @click=${() => this.handleTabClick(tab)}
        @keydown=${(e: KeyboardEvent) => this.handleKeydown(e, tab)}
      >
        ${tab.label}
      </button>
    `;
  }

  override render() {
    return html`
      <div class=${containerVariants()} role="tablist">
        ${this.tabs.map((tab) => this.renderTab(tab))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-tabs": LedgerTabs;
  }

  interface WindowEventMap {
    "tab-change": CustomEvent<TabChangeEventDetail>;
  }
}

export default LedgerTabs;
