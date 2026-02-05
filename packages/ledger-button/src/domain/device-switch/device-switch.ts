import "../../components/index.js";

import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { DeviceItemClickEventDetail } from "../../components/molecule/device-item/ledger-device-item.js";
import { CoreContext, coreContext } from "../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../context/language-context.js";
import { Navigation } from "../../shared/navigation.js";
import { Destination, Destinations } from "../../shared/routes.js";
import { tailwindElement } from "../../tailwind-element.js";
import { DeviceSwitchController } from "./device-switch-controller.js";

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

@customElement("device-switch-screen")
@tailwindElement(styles)
export class DeviceSwitchScreen extends LitElement {
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

  @state()
  private isLoading = true;

  controller!: DeviceSwitchController;

  override connectedCallback() {
    super.connectedCallback();

    this.controller = new DeviceSwitchController(
      this,
      this.coreContext,
      this.navigation,
      this.destinations,
    );

    this.controller.hostConnected().finally(() => {
      this.isLoading = false;
      this.requestUpdate();
    });
  }

  handleDeviceItemClick = (e: CustomEvent<DeviceItemClickEventDetail>) => {
    this.controller.connectToDevice({
      title: e.detail.title,
      connectionType: e.detail.connectionType,
      timestamp: e.detail.timestamp,
    });
  };

  handleAddNewDevice = () => {
    this.controller.addNewDevice();
  };

  private renderDeviceList() {
    const devices = this.controller?.getDevices() || [];

    if (this.isLoading) {
      return html`
        <div class="lb-flex lb-items-center lb-justify-center lb-p-24">
          <div
            class="lb-border-primary lb-h-32 lb-w-32 lb-animate-spin lb-rounded-full lb-border-b-2"
          ></div>
        </div>
      `;
    }

    if (devices.length === 0) {
      return html`
        <div
          class="lb-flex lb-flex-col lb-items-center lb-gap-16 lb-p-24 lb-text-center"
        >
          <div class="lb-text-muted lb-body-2">
            ${this.languageContext.currentTranslation.deviceSwitch.noDevices}
          </div>
        </div>
      `;
    }

    return html`
      <div class="lb-flex lb-flex-col lb-gap-12 lb-p-24 lb-pt-0">
        ${devices.map((device) => {
          const connectionType = this.controller.getConnectionTypeFromTransport(
            device.transport,
          );
          const connectedDevice = this.coreContext.getConnectedDevice();
          const isConnected =
            connectedDevice && connectedDevice.name === device.name;
          const status = isConnected ? "connected" : "available";
          const deviceModelId = this.controller.mapDeviceModelId(
            device.deviceModel?.model,
          );

          const lang = this.languageContext.currentTranslation;

          return html`
            <ledger-device-item
              device-id=${device.id}
              title=${device.name}
              connection-type=${connectionType}
              device-model-id=${deviceModelId}
              status=${status}
              connected-text=${lang.deviceSwitch.status.connected}
              available-text=${lang.deviceSwitch.status.available}
              @device-item-click=${this.handleDeviceItemClick}
            ></ledger-device-item>
          `;
        })}
      </div>
    `;
  }

  private renderSeparator() {
    return html`
      <div class="lb-relative lb-flex lb-items-center lb-gap-8 lb-px-24">
        <div class="lb-h-1 lb-flex-1 lb-bg-muted-pressed"></div>
        <span class="lb-px-4 lb-text-muted lb-body-3"
          >${this.languageContext.currentTranslation.deviceSwitch
            .connectAnother}</span
        >
        <div class="lb-h-1 lb-flex-1 lb-bg-muted-pressed"></div>
      </div>
    `;
  }

  private renderAddNewDeviceSection() {
    return html`
      <div class="lb-flex lb-flex-col lb-gap-12 lb-p-24">
        <ledger-connection-item
          title="${this.languageContext.currentTranslation.deviceSwitch
            .connectBluetooth}"
          connection-type="bluetooth"
          @connection-item-click=${this.handleAddNewDevice}
        ></ledger-connection-item>
        <ledger-connection-item
          title="${this.languageContext.currentTranslation.deviceSwitch
            .connectUsb}"
          connection-type="usb"
          @connection-item-click=${this.handleAddNewDevice}
        ></ledger-connection-item>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="lb-flex lb-flex-col">
        ${this.renderDeviceList()} ${this.renderSeparator()}
        ${this.renderAddNewDeviceSection()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "device-switch-screen": DeviceSwitchScreen;
  }
}

export default DeviceSwitchScreen;
