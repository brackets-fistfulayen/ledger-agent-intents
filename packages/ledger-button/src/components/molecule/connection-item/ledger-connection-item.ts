import "../../atom/icon/ledger-icon";

import { cva } from "class-variance-authority";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { tailwindElement } from "../../../tailwind-element.js";

const connectionItemVariants = cva(
  [
    "lb-flex lb-items-center lb-justify-between lb-rounded-md lb-group",
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

export type ConnectionItemClickEventDetail = {
  title: string;
  connectionType: "bluetooth" | "usb" | "";
  timestamp: number;
};

export interface LedgerConnectionItemAttributes {
  title?: string;
  connectionType?: "bluetooth" | "usb";
  clickable?: boolean;
  disabled?: boolean;
}

@customElement("ledger-connection-item")
@tailwindElement()
export class LedgerConnectionItem extends LitElement {
  @property({ type: String })
  override title = "";

  @property({ type: String, attribute: "hint" })
  hint = "";

  @property({ type: String, attribute: "connection-type" })
  connectionType: "bluetooth" | "usb" | "" = "";

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
      new CustomEvent<ConnectionItemClickEventDetail>("connection-item-click", {
        bubbles: true,
        composed: true,
        detail: {
          title: this.title,
          connectionType: this.connectionType,
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

  private renderIcon() {
    if (this.connectionType) {
      return html`
        <div
          class="lb-rounded-full lb-p-8 lb-drop-shadow-md lb-bg-muted-transparent"
        >
          <ledger-icon type=${this.connectionType} size="medium"></ledger-icon>
        </div>
      `;
    }
    return "";
  }

  private renderChevron() {
    return html`
      <div
        class="lb-pr-2 lb-transition-transform lb-duration-150 lb-ease-in-out group-hover:lb-translate-x-1"
      >
        <ledger-icon type="chevronRight" size="small"></ledger-icon>
      </div>
    `;
  }

  private renderTitle() {
    return html`
      ${this.title
        ? html`<span class="lb-py-2 lb-text-base lb-body-2"
            >${this.title}</span
          >`
        : ""}
    `;
  }

  private renderHint() {
    return html`<span class="lb-text-muted lb-body-3">${this.hint}</span>`;
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
          ${this.renderIcon()}
          <div class="lb-flex lb-flex-col lb-items-start lb-gap-2">
            ${this.renderTitle()} ${this.renderHint()}
          </div>
        </div>
        ${this.renderChevron()}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-connection-item": LedgerConnectionItem;
  }
}

export default LedgerConnectionItem;
