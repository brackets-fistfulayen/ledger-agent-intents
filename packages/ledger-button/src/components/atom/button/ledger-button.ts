import "../icon/ledger-icon";

import { cva } from "class-variance-authority";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { tailwindElement } from "../../../tailwind-element.js";
import { LedgerIconAttributes } from "../icon/ledger-icon.js";

export type ButtonVariant = "primary" | "secondary" | "accent" | "noBackground";
export type ButtonSize = "small" | "medium" | "large" | "xs" | "full";
export type IconPosition = "left" | "right";

export interface LedgerButtonAttributes {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: boolean;
  iconPosition?: IconPosition;
  type?: "button" | "submit" | "reset";
}

const buttonVariants = cva(
  [
    "lb-flex lb-cursor-pointer lb-items-center lb-justify-center lb-gap-8 lb-rounded-full lb-body-1-semi-bold",
    "disabled:lb-cursor-not-allowed disabled:lb-bg-disabled disabled:lb-text-disabled",
  ],
  {
    variants: {
      variant: {
        accent: [
          "lb-bg-accent lb-text-on-accent",
          "hover:lb-bg-accent-hover active:lb-bg-accent-pressed",
        ],
        primary: [
          "lb-bg-interactive lb-text-on-interactive",
          "hover:lb-bg-interactive-hover active:lb-bg-interactive-pressed",
        ],
        secondary: [
          "lb-bg-muted lb-text-base",
          "hover:lb-bg-muted-hover active:lb-bg-muted-pressed",
        ],
        "secondary-transparent": [
          "lb-bg-muted-transparent lb-text-base",
          "hover:lb-bg-muted-transparent-hover active:lb-bg-muted-transparent-pressed",
        ],
        noBackground: [
          "lb-bg-base-transparent lb-text-base",
          "hover:lb-bg-base-transparent-hover active:lb-bg-base-transparent-pressed",
        ],
      },
      size: {
        xs: ["lb-p-8"],
        small: ["lb-px-16 lb-py-12", "lb-body-2-semi-bold"],
        medium: ["lb-px-16 lb-py-12"],
        large: ["lb-px-32 lb-py-16"],
        full: ["lb-w-full", "lb-h-56"],
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

const styles = css`
  :host {
    display: block;
  }

  :host([disabled]) {
    pointer-events: none;
  }
`;

@customElement("ledger-button")
@tailwindElement(styles)
export class LedgerButton extends LitElement {
  @property({ type: String })
  label = "";

  @property({ type: String })
  variant: ButtonVariant = "primary";

  @property({ type: String })
  size: ButtonSize = "medium";

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  icon = false;

  @property({ type: String })
  iconType?: LedgerIconAttributes["type"];

  @property({ type: String, attribute: "icon-position" })
  iconPosition: IconPosition = "left";

  @property({ type: String })
  type: "button" | "submit" | "reset" = "button";

  private get buttonClasses() {
    return {
      [buttonVariants({ variant: this.variant, size: this.size })]: true,
    };
  }

  private renderIcon() {
    if (!this.icon) {
      return nothing;
    }

    const fillColor = this.variant === "primary" ? "black" : "white";
    const size = this.size === "xs" ? "small" : this.size;

    return html`
      <ledger-icon
        .type=${this.iconType ?? "ledger"}
        size=${size}
        class="lb-text-base"
        .fillColor=${fillColor}
      >
      </ledger-icon>
    `;
  }

  private renderLabel() {
    if (this.label === "") {
      return nothing;
    }

    return html`${this.label}`;
  }

  override render() {
    return html`
      <button
        type="${this.type}"
        class=${classMap(this.buttonClasses)}
        ?disabled=${this.disabled}
        aria-label="${this.label}"
        @click=${this.handleClick}
      >
        ${this.iconPosition === "left" && this.icon
          ? html`${this.renderIcon()}${this.renderLabel()}`
          : ""}
        ${this.iconPosition === "right" && this.icon
          ? html`${this.renderLabel()}${this.renderIcon()}`
          : ""}
        ${!this.icon ? this.renderLabel() : nothing}
      </button>
    `;
  }

  private handleClick(event: Event) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    this.dispatchEvent(
      new CustomEvent("ledger-button-click", {
        bubbles: true,
        composed: true,
        detail: {
          timestamp: Date.now(),
          variant: this.variant,
          size: this.size,
          label: this.label,
        },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-button": LedgerButton;
  }

  interface WindowEventMap {
    "ledger-button-click": CustomEvent<{
      timestamp: number;
      variant: ButtonVariant;
      size: ButtonSize;
      label: string;
    }>;
  }
}

export default LedgerButton;
