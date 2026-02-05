import "../../components/index.js";

import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CoreContext, coreContext } from "../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../context/language-context.js";
import { Navigation } from "../../shared/navigation.js";
import { Destination, Destinations } from "../../shared/routes.js";
import { tailwindElement } from "../../tailwind-element.js";
import { DeviceConnectionStatusController } from "./device-connection-status-controller.js";

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

@customElement("device-connection-status-screen")
@tailwindElement(styles)
export class DeviceConnectionStatusScreen extends LitElement {
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

  private get deviceInfo() {
    return this.coreContext.getConnectedDevice();
  }

  controller!: DeviceConnectionStatusController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new DeviceConnectionStatusController(
      this.coreContext,
      this.navigation,
      this.destinations,
    );
    this.controller.hostConnected();
  }

  override render() {
    const lang = this.languageContext.currentTranslation;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const device = this.deviceInfo!;
    const deviceDisplayName =
      device.name ||
      lang.common.device.model[
        device.modelId as keyof typeof lang.common.device.model
      ];

    return html`
      <div class="lb-flex lb-h-full lb-flex-col">
        <div class="lb-flex lb-flex-1 lb-items-center lb-justify-center">
          <ledger-info-state
            device=${device?.iconType}
            title="${lang.common.device.deviceActions.continueOnLedger
              .title} ${deviceDisplayName}"
            subtitle=${lang.common.device.deviceActions.continueOnLedger
              .description}
          ></ledger-info-state>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "device-connection-status-screen": DeviceConnectionStatusScreen;
  }
}

export default DeviceConnectionStatusScreen;
