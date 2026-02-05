import { cva } from "class-variance-authority";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { tailwindElement } from "../../../tailwind-element.js";

const platformItemVariants = cva(
  [
    "group lb-flex lb-items-center lb-justify-between lb-rounded-md",
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

export type PlatformItemClickEventDetail = {
  platformType: "mobile" | "desktop";
};

@customElement("ledger-platform-item")
@tailwindElement()
export class LedgerPlatformItem extends LitElement {
  @property({ type: String })
  override title = "";

  @property({ type: String, attribute: "platform-type" })
  platformType: "mobile" | "desktop" = "mobile";

  @property({ type: Boolean })
  clickable = true;

  @property({ type: Boolean })
  disabled = false;

  private get containerClasses() {
    return {
      [platformItemVariants({
        clickable: this.clickable,
        disabled: this.disabled,
      })]: true,
    };
  }

  private handleClick() {
    if (this.disabled || !this.clickable) return;

    this.dispatchEvent(
      new CustomEvent<PlatformItemClickEventDetail>(
        "ledger-platform-item-click",
        {
          bubbles: true,
          composed: true,
          detail: {
            platformType: this.platformType,
          },
        },
      ),
    );
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.disabled || !this.clickable) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handleClick();
    }
  }

  private renderPlatformIcon() {
    return html`
      <div
        class="lb-rounded-full lb-bg-muted-transparent lb-p-8 lb-drop-shadow-md"
      >
        <ledger-icon
          type=${this.platformType}
          size="small"
          fillColor="white"
        ></ledger-icon>
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

  private renderChevron() {
    return html`
      <div
        class="lb-pr-2 lb-transition-transform lb-duration-150 lb-ease-in-out group-hover:lb-translate-x-1"
      >
        <ledger-icon type="chevronRight" size="small"></ledger-icon>
      </div>
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
          ${this.renderPlatformIcon()}
          <div class="lb-flex lb-flex-col lb-items-start lb-gap-4">
            ${this.renderTitle()}
          </div>
        </div>
        ${this.renderChevron()}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-platform-item": LedgerPlatformItem;
  }
}

export default LedgerPlatformItem;
