import "../../atom/button/ledger-button";
import "../../atom/icon/ledger-icon";

import { cva } from "class-variance-authority";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { tailwindElement } from "../../../tailwind-element.js";

export type StatusType = "success" | "error";

export interface LedgerStatusAttributes {
  type?: StatusType;
  title?: string;
  description?: string;
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  showSecondaryButton?: boolean;
}

const statusVariants = cva(["lb-max-w-sm"], {
  variants: {
    type: {
      success: "",
      error: "",
    },
  },
  defaultVariants: {
    type: "success",
  },
});

const statusIconVariants = cva(
  [
    "lb-flex lb-h-64 lb-w-64 lb-items-center lb-justify-center lb-rounded-full lb-p-12",
  ],
  {
    variants: {
      type: {
        success: "lb-bg-success",
        error: "lb-bg-error",
      },
    },
    defaultVariants: {
      type: "success",
    },
  },
);

@customElement("ledger-status")
@tailwindElement()
export class LedgerStatus extends LitElement {
  @property({ type: String })
  type: StatusType = "success";

  @property({ type: String })
  override title = "";

  @property({ type: String })
  description = "";

  @property({ type: String, attribute: "primary-button-label" })
  primaryButtonLabel = "Close";

  @property({ type: String, attribute: "secondary-button-label" })
  secondaryButtonLabel = "Secondary action";

  private get containerClasses() {
    const classString = statusVariants({ type: this.type });
    const classes = classString.split(" ").filter(Boolean);
    return classes.reduce(
      (acc, className) => {
        acc[className] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  private get statusIconClasses() {
    const classString = statusIconVariants({ type: this.type });
    const classes = classString.split(" ").filter(Boolean);
    return classes.reduce(
      (acc, className) => {
        acc[className] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  private get iconType() {
    return this.type === "success" ? "check" : "error";
  }

  private handlePrimaryAction() {
    this.dispatchEvent(
      new CustomEvent("status-action", {
        bubbles: true,
        composed: true,
        detail: {
          timestamp: Date.now(),
          action: "primary",
          type: this.type,
        },
      }),
    );
  }

  private handleSecondaryAction() {
    this.dispatchEvent(
      new CustomEvent("status-action", {
        bubbles: true,
        composed: true,
        detail: {
          timestamp: Date.now(),
          action: "secondary",
          type: this.type,
        },
      }),
    );
  }

  override render() {
    return html`
      <div class=${classMap(this.containerClasses)}>
        <div class="lb-flex lb-flex-col lb-items-center lb-gap-32">
          <div class="lb-flex lb-flex-col lb-items-center lb-gap-24">
            <div class="lb-flex lb-justify-center">
              <div
                class=${classMap(this.statusIconClasses)}
                role="img"
                aria-label="${this.type === "success" ? "Success" : "Error"}"
              >
                <ledger-icon type=${this.iconType} size="large"></ledger-icon>
              </div>
            </div>
            <div
              class="lb-flex lb-flex-col lb-items-center lb-gap-8 lb-text-center"
            >
              ${this.title
                ? html`
                    <h2
                      id="status-title"
                      class="lb-text-base lb-heading-4-semi-bold"
                    >
                      ${this.title}
                    </h2>
                  `
                : ""}
              ${this.description
                ? html`
                    <p id="status-description" class="lb-text-muted lb-body-2">
                      ${this.description}
                    </p>
                  `
                : ""}
            </div>
          </div>
          <div class="lb-flex lb-flex-col lb-gap-16 lb-self-stretch">
            ${this.secondaryButtonLabel
              ? html`
                  <ledger-button
                    label=${this.secondaryButtonLabel}
                    variant="secondary"
                    size="full"
                    @ledger-button-click=${this.handleSecondaryAction}
                  ></ledger-button>
                `
              : ""}

            <ledger-button
              label=${this.primaryButtonLabel}
              variant="primary"
              size="full"
              @ledger-button-click=${this.handlePrimaryAction}
            ></ledger-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-status": LedgerStatus;
  }

  interface WindowEventMap {
    "ledger-status-action": CustomEvent<{
      timestamp: number;
      action: "primary" | "secondary";
      type: StatusType;
    }>;
  }
}

export default LedgerStatus;
