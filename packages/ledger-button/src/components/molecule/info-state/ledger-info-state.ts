import "../../atom/icon/ledger-icon";

import { cva } from "class-variance-authority";
import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { tailwindElement } from "../../../tailwind-element.js";
import FlexDeviceIcon from "./flex-device-icon.js";
import NanoxDeviceIcon from "./nanox-device-icon.js";
import StaxDeviceIcon from "./stax-device-icon.js";

export type DeviceType = "nanox" | "stax" | "flex" | "apexp";

const infoStateVariants = cva(
  "lb-flex lb-flex-col lb-items-center lb-justify-center lb-text-center lb-text-base",
  {
    variants: {
      device: {
        flex: "lb-p-24 lb-pt-0",
        apexp: "lb-p-24 lb-pt-0",
        nanox: "lb-p-20 lb-pt-0",
        stax: "lb-p-28 lb-pt-0",
      },
    },
    defaultVariants: {
      device: "flex",
    },
  },
);

const deviceIconVariants = cva("", {
  variants: {
    device: {
      flex: "",
      apexp: "",
      nanox: "lb-opacity-80",
      stax: "lb-opacity-90",
    },
  },
  defaultVariants: {
    device: "flex",
  },
});

export interface LedgerInfoStateAttributes {
  device: DeviceType;
  title: string;
  subtitle?: string;
}

@customElement("ledger-info-state")
@tailwindElement()
export class LedgerInfoState extends LitElement {
  @property({ type: String })
  device: DeviceType = "flex";

  @property({ type: String })
  override title = "";

  @property({ type: String })
  subtitle = "";

  private renderDeviceIcon() {
    const deviceMapper = {
      flex: FlexDeviceIcon,
      nanox: NanoxDeviceIcon,
      stax: StaxDeviceIcon,
      apexp: FlexDeviceIcon,
    };

    return deviceMapper[this.device];
  }

  override render() {
    return html`
      <div class="${infoStateVariants({ device: this.device })}">
        <div
          class="lb-flex lb-flex-col lb-items-center lb-justify-center lb-gap-32"
        >
          <div
            class="${deviceIconVariants({ device: this.device })}"
            data-testid="device-icon"
          >
            ${this.renderDeviceIcon()}
          </div>
          <div
            class="lb-flex lb-flex-col lb-items-center lb-justify-center lb-gap-16"
          >
            <h4
              class="lb-font-semibold lb-leading-tight lb-font-inter lb-text-base lb-heading-4"
              data-testid="title"
            >
              ${this.title}
            </h4>

            ${this.subtitle
              ? html`
                  <p
                    class="lb-font-normal lb-leading-relaxed lb-max-w-300 lb-font-inter lb-text-base lb-opacity-60 lb-body-1"
                    data-testid="subtitle"
                  >
                    ${this.subtitle}
                  </p>
                `
              : nothing}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-info-state": LedgerInfoState;
  }
}

export default LedgerInfoState;
