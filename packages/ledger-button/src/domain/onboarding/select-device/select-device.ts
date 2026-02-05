import "../../../components/index.js";

import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { type StatusType } from "../../../components/index.js";
import type { ConnectionItemClickEventDetail } from "../../../components/molecule/connection-item/ledger-connection-item.js";
import { CoreContext, coreContext } from "../../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { Destination, Destinations } from "../../../shared/routes.js";
import { tailwindElement } from "../../../tailwind-element.js";
import { SelectDeviceController } from "./select-device-controller.js";

const styles = css`
  :host {
    animation: intro 250ms ease-in-out;
    transform-origin: left bottom;
  }

  :host(.remove) {
    animation: intro 250ms ease-in-out reverse;
  }

  @keyframes intro {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(32px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;
@customElement("select-device-screen")
@tailwindElement(styles)
export class SelectDeviceScreen extends LitElement {
  @property({ type: Object })
  navigation!: Navigation;

  @property({ type: Object })
  destinations!: Destinations;

  @property({ type: Object })
  navigateTo!: (destination: Destination) => Promise<void>;

  @consume({ context: coreContext })
  @property({ attribute: false })
  public coreContext!: CoreContext;

  @consume({ context: langContext })
  @property({ attribute: false })
  public languageContext!: LanguageContext;

  controller!: SelectDeviceController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new SelectDeviceController(
      this,
      this.coreContext,
      this.languageContext,
    );
  }

  handleConnectionItemClick = (
    e: CustomEvent<ConnectionItemClickEventDetail>,
  ) => {
    this.controller.connectToDevice(e.detail);
  };

  handleAdItemClick = () => {
    this.controller.clickAdItem();
  };

  private handleStatusAction = async (
    e: CustomEvent<{
      timestamp: number;
      action: "primary" | "secondary";
      type: StatusType;
    }>,
  ) => {
    if (e.detail.action === "primary") {
      await this.controller.errorData?.cta1?.action();
    } else if (e.detail.action === "secondary") {
      await this.controller.errorData?.cta2?.action();
    }
  };

  renderScreen() {
    const lang = this.languageContext.currentTranslation;
    return html`
      <div class="lb-flex lb-flex-col lb-gap-12 lb-p-24 lb-pt-0">
        ${(["bluetooth", "usb"] as const).map((el) => {
          return html`
            <ledger-connection-item
              title=${lang.common.button[el]}
              hint=${lang.common.button[`${el}_hint`]}
              connection-type=${el}
              @connection-item-click=${this.handleConnectionItemClick}
            ></ledger-connection-item>
          `;
        })}
      </div>
      <div
        class="lb-flex lb-flex-col lb-gap-12 lb-border lb-border-b-0 lb-border-l-0 lb-border-r-0 lb-border-muted-subtle lb-p-24"
      >
        <ledger-ad-item
          title=${lang.common.ad.getALedger}
          @ad-item-click=${this.handleAdItemClick}
        ></ledger-ad-item>
      </div>
    `;
  }

  renderErrorScreen() {
    if (!this.controller.errorData) {
      return html``;
    }

    return html`
      <div class="lb-flex lb-flex-col lb-gap-12 lb-p-24 lb-pt-0">
        <ledger-status
          type="error"
          title=${this.controller.errorData.title}
          description=${this.controller.errorData.message}
          primary-button-label=${this.controller.errorData.cta1?.label ?? ""}
          secondary-button-label=${this.controller.errorData.cta2?.label ?? ""}
          @status-action=${this.handleStatusAction}
        ></ledger-status>
      </div>
    `;
  }

  override render() {
    return html` <div class="lb-flex lb-flex-col">
      ${this.controller.errorData
        ? this.renderErrorScreen()
        : this.renderScreen()}
    </div>`;
  }
}
