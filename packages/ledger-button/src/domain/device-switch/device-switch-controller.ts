import type { DiscoveredDevice } from "@ledgerhq/ledger-wallet-provider-core";
import { LitElement } from "lit";

import type { DeviceModelId } from "../../components/atom/icon/device-icon/device-icon.js";
import type { CoreContext } from "../../context/core-context.js";
import type { Navigation } from "../../shared/navigation.js";
import type { Destinations } from "../../shared/routes.js";

export class DeviceSwitchController {
  private devices: DiscoveredDevice[] = [];

  constructor(
    private readonly host: LitElement,
    private readonly coreContext: CoreContext,
    private readonly navigation: Navigation,
    private readonly destinations: Destinations,
  ) {}

  async hostConnected() {
    await this.loadAvailableDevices();
  }

  async loadAvailableDevices() {
    try {
      this.devices = await this.coreContext.listAvailableDevices();

      this.host.requestUpdate();
    } catch {
      this.devices = [];
      this.host.requestUpdate();
    }
  }

  getDevices(): DiscoveredDevice[] {
    return this.devices;
  }

  async connectToDevice(detail: {
    title: string;
    connectionType: "bluetooth" | "usb" | "";
    timestamp: number;
  }) {
    const connectionType = detail.connectionType;
    if (!connectionType) {
      return;
    }

    // Navigate to connection status screen to show device animation
    this.navigation.navigateTo(this.destinations.deviceConnectionStatus);

    try {
      await this.coreContext.connectToDevice(connectionType);

      const pendingTransactionParams =
        this.coreContext.getPendingTransactionParams();

      if (pendingTransactionParams) {
        this.navigation.navigateTo(this.destinations.signTransaction);
      } else {
        this.navigation.navigateTo(this.destinations.ledgerSync);
      }
    } catch {
      this.navigation.navigateTo(this.destinations.onboardingFlow);
    }
  }

  async addNewDevice() {
    this.navigation.navigateTo(this.destinations.onboardingFlow);
  }

  getConnectionTypeFromTransport(transport: string): "bluetooth" | "usb" | "" {
    const transportLower = transport.toLowerCase();

    if (
      transportLower.includes("ble") ||
      transportLower.includes("bluetooth")
    ) {
      return "bluetooth";
    }
    if (transportLower.includes("usb") || transportLower.includes("hid")) {
      return "usb";
    }
    return "";
  }

  mapDeviceModelId(deviceModelId?: string): DeviceModelId {
    if (!deviceModelId) {
      return "flex";
    }

    const modelStr = deviceModelId.toString();
    const transformedModel = modelStr.replace(/_/g, "");

    const validModels: DeviceModelId[] = [
      "stax",
      "flex",
      "nanoX",
      "nanoS",
      "nanoSP",
    ];

    if (validModels.includes(transformedModel as DeviceModelId)) {
      return transformedModel as DeviceModelId;
    }

    return "flex";
  }
}
