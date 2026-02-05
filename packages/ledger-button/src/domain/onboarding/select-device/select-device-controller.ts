import {
  DeviceConnectionError,
  DeviceDisconnectedError,
  DeviceNotSupportedError,
} from "@ledgerhq/ledger-wallet-provider-core";
import { type ReactiveController, type ReactiveControllerHost } from "lit";

import { type CoreContext } from "../../../context/core-context.js";
import { type LanguageContext } from "../../../context/language-context.js";

export class SelectDeviceController implements ReactiveController {
  errorData?: {
    message: string;
    title: string;
    cta1?: { label: string; action: () => void | Promise<void> };
    cta2?: { label: string; action: () => void | Promise<void> };
  } = undefined;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly core: CoreContext,
    private readonly lang: LanguageContext,
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.host.requestUpdate();
  }

  async clickAdItem() {
    await this.core
      .getReferralUrl()
      .then((url) => window.open(url, "_blank", "noopener,noreferrer"))
      .catch((error) =>
        console.error("Failed to get a valid referral url", error),
      );
  }

  private mapErrors(error: unknown) {
    const lang = this.lang.currentTranslation;

    if (error instanceof DeviceNotSupportedError) {
      const deviceName = error.context?.modelId
        ? lang.common.device.model[error.context.modelId]
        : lang.common.device.model.fallback;

      const title = lang.error.device.DeviceNotSupported.title.replace(
        "{device}",
        deviceName,
      );
      const description =
        lang.error.device.DeviceNotSupported.description.replace(
          "{device}",
          deviceName,
        );

      this.errorData = {
        title,
        message: description,
        cta1: {
          label: lang.error.device.DeviceNotSupported.cta1,
          action: () => {
            this.errorData = undefined;
            this.host.requestUpdate();
          },
        },
        cta2: {
          label: lang.error.device.DeviceNotSupported.cta2,
          action: () => {
            window.open(
              "https://shop.ledger.com/pages/ledger-nano-s-upgrade-program?utm_source=support",
              "_blank",
              "noopener,noreferrer",
            );
          },
        },
      };
    } else if (error instanceof DeviceDisconnectedError) {
      const description = lang.error.connection.DeviceDisconnected.description;

      this.errorData = {
        title: lang.error.connection.DeviceDisconnected.title,
        message: description,
        cta1: {
          label: lang.error.connection.DeviceDisconnected.cta1,
          action: () => {
            this.errorData = undefined;
            this.host.requestUpdate();
          },
        },
      };
    } else if (error instanceof DeviceConnectionError) {
      if (
        error.context?.type === "no-accessible-device" ||
        error.context?.type === "failed-to-start-discovery"
      ) {
        this.errorData = undefined;
      }
      // TODO: handle other DeviceConnectionError cases
    }
    // TODO: handle other error types

    this.host.requestUpdate();
  }

  async connectToDevice(detail: {
    title: string;
    connectionType: "bluetooth" | "usb" | "";
    timestamp: number;
  }) {
    if (detail.connectionType === "") {
      console.error("No connection type selected");
      return;
    }

    try {
      await this.core.connectToDevice(detail.connectionType);
    } catch (error) {
      console.error("Failed to connect to device", error);
      this.mapErrors(error);
    }
  }
}
