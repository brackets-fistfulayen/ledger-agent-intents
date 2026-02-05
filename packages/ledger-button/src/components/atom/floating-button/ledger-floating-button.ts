import "../icon/ledger-icon";

import { consume } from "@lit/context";
import { cva } from "class-variance-authority";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { CoreContext, coreContext } from "../../../context/core-context.js";
import { tailwindElement } from "../../../tailwind-element.js";
import { FloatingButtonController } from "./ledger-floating-button-controller.js";

export type FloatingButtonPosition =
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
  | "top-right"
  | "top-left"
  | "top-center";

export type FloatingButtonVariant = "circular" | "compact";

const floatingButtonVariants = cva(
  "lb-flex lb-cursor-pointer lb-items-center lb-justify-center lb-bg-black lb-text-on-interactive lb-shadow-[0_4px_12px_rgba(0,0,0,0.3)] lb-transition-[transform,box-shadow] lb-duration-200 lb-ease-in-out hover:lb-shadow-[0_6px_16px_rgba(0,0,0,0.4)]",
  {
    variants: {
      variant: {
        circular:
          "lb-fixed lb-z-[1000] lb-h-64 lb-w-64 lb-rounded-full lb-border lb-border-muted-subtle hover:lb-scale-105 active:lb-scale-95",
        compact:
          "lb-content-stretch lb-gap-8 lb-overflow-hidden lb-rounded-md lb-px-12 lb-py-8",
      },
      position: {
        "bottom-right": "lb-bottom-24 lb-right-24",
        "bottom-left": "lb-bottom-24 lb-left-24",
        "bottom-center": "lb-bottom-24 lb-left-1/2 lb--translate-x-1/2",
        "top-right": "lb-right-24 lb-top-24",
        "top-left": "lb-left-24 lb-top-24",
        "top-center": "lb-left-1/2 lb-top-24 lb--translate-x-1/2",
        none: "",
      },
    },
    compoundVariants: [
      {
        variant: "circular",
        class: "lb-fixed lb-z-[1000]",
      },
    ],
    defaultVariants: {
      variant: "circular",
      position: "bottom-right",
    },
  },
);

const styles = css`
  :host {
    display: contents;
  }

  :host([hidden]) {
    display: none;
  }
`;

@customElement("ledger-floating-button")
@tailwindElement(styles)
export class LedgerFloatingButton extends LitElement {
  @consume({ context: coreContext })
  @state()
  private coreContext!: CoreContext;

  @property({ type: Object, attribute: false })
  core?: CoreContext;

  @property({ type: String })
  position: FloatingButtonPosition = "bottom-right";

  @property({ type: String })
  variant: FloatingButtonVariant = "circular";

  private controller!: FloatingButtonController;

  private get floatingButtonClasses() {
    const pos = this.variant === "compact" ? "none" : this.position;
    return {
      [floatingButtonVariants({ variant: this.variant, position: pos })]: true,
    };
  }

  override connectedCallback() {
    super.connectedCallback();
    const coreInstance = this.core || this.coreContext;
    if (coreInstance) {
      this.controller = new FloatingButtonController(this, coreInstance);
    }
  }

  override updated() {
    const coreInstance = this.core || this.coreContext;
    if (!this.controller && coreInstance) {
      this.controller = new FloatingButtonController(this, coreInstance);
      this.requestUpdate();
    }
  }

  private handleClick = () => {
    this.dispatchEvent(
      new CustomEvent("ledger-internal-floating-button-click", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  override render() {
    if (!this.controller?.shouldShow) {
      return nothing;
    }

    const iconSize = this.variant === "compact" ? "small" : "large";

    return html`
      <button
        class=${classMap(this.floatingButtonClasses)}
        @click=${this.handleClick}
        aria-label="Open Ledger account menu"
      >
        <ledger-icon
          type="ledger"
          size=${iconSize}
          fillColor="white"
        ></ledger-icon>
        ${this.variant === "compact"
          ? html`<span
              class="lb-font-medium lb-leading-normal lb-shrink-0 lb-not-italic lb-text-white"
              >Ledger</span
            >`
          : nothing}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-floating-button": LedgerFloatingButton;
  }
}
