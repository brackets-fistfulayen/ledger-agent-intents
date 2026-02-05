import "../../atom/button/ledger-button.js";

import { cva } from "class-variance-authority";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { tailwindElement } from "../../../tailwind-element.js";

const connectionItemVariants = cva(
  [
    "lb-flex lb-items-center lb-justify-between lb-rounded-md group",
    "lb-min-w-full",
    "lb-bg-muted lb-p-12 lb-transition lb-duration-150 lb-ease-in-out hover:lb-bg-muted-hover",
  ],
  {
    variants: {
      clickable: {
        true: ["lb-cursor-pointer"],
        false: ["lb-cursor-default"],
      },
      disabled: {
        true: ["lb-pointer-events-none lb-cursor-not-allowed lb-opacity-50"],
        false: [],
      },
    },
    defaultVariants: {
      clickable: true,
      disabled: false,
    },
  },
);

@customElement("ledger-ad-item")
@tailwindElement()
export class LedgerAdItem extends LitElement {
  @property({ type: String })
  override title = "";

  @property({ type: Boolean })
  clickable = true;

  @property({ type: Boolean })
  disabled = false;

  private get containerClasses() {
    return {
      [connectionItemVariants({
        clickable: this.clickable,
        disabled: this.disabled,
      })]: true,
    };
  }

  private handleClick() {
    if (this.disabled || !this.clickable) return;

    this.dispatchEvent(
      new CustomEvent("ad-item-click", {
        bubbles: true,
        composed: true,
        detail: {
          title: this.title,
          timestamp: Date.now(),
        },
      }),
    );
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.disabled || !this.clickable) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleClick();
    }
  }

  private renderChevron() {
    return html`
      <div
        class="group-hover:lb-translate-x-1 lb-pr-2 lb-transition-transform lb-duration-150 lb-ease-in-out"
      >
        <ledger-icon type="chevronRight" size="small"></ledger-icon>
      </div>
    `;
  }

  private renderTitle() {
    return html`
      ${this.title
        ? html`<span class="lb-py-8 lb-text-base lb-body-2"
            >${this.title}</span
          >`
        : ""}
    `;
  }

  override render() {
    return html`
      <button
        class=${classMap(this.containerClasses)}
        ?disabled=${this.disabled}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        role="button"
        tabindex=${this.disabled ? "-1" : "0"}
        aria-label=${this.title || ""}
      >
        <div class="lb-flex lb-items-center lb-gap-12">
          <div
            class="lb-rounded-full lb-bg-muted-transparent lb-p-8 lb-drop-shadow-md"
          >
            <ledger-icon type="cart" size="small"></ledger-icon>
          </div>
          ${this.renderTitle()}
        </div>
        ${this.renderChevron()}
      </button>
    `;
  }
}
