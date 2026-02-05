import {
  type AuthContext,
  type Device,
  type LedgerSyncAuthenticateResponse,
  LedgerSyncAuthenticationError,
  LedgerSyncConnectionFailedError,
  type UserInteractionNeeded,
  type UserInteractionNeededResponse,
} from "@ledgerhq/ledger-wallet-provider-core";
import { type ReactiveController, type ReactiveControllerHost } from "lit";
import { Subscription } from "rxjs";

import { AnimationKey } from "../../../components/molecule/device-animation/device-animation.js";
import { type CoreContext } from "../../../context/core-context.js";
import { type LanguageContext } from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { type Destinations } from "../../../shared/routes.js";

export class LedgerSyncController implements ReactiveController {
  device?: Device;
  animation: Omit<AnimationKey, "pairing" | "pairingSuccess" | "frontView"> =
    "continueOnLedger";
  ledgerSyncSubscription: Subscription | undefined = undefined;
  errorData?: {
    message: string;
    title: string;
    cta1?: { label: string; action: () => void };
    cta2?: { label: string; action: () => void };
  } = undefined;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly core: CoreContext,
    private readonly navigation: Navigation,
    private readonly destinations: Destinations,
    private readonly lang: LanguageContext,
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.getConnectedDevice();
  }

  private mapUserInteractionToDeviceAnimation(
    interaction: UserInteractionNeeded,
  ): Omit<AnimationKey, "pairing" | "pairingSuccess" | "frontView"> {
    switch (interaction) {
      case "unlock-device":
        return "pin";
      case "allow-secure-connection":
      case "confirm-open-app":
      case "allow-list-apps":
      case "web3-checks-opt-in":
      case "lkrp-authenticate":
        return "continueOnLedger";
      case "sign-transaction":
      default:
        return "signTransaction";
    }
  }

  async getConnectedDevice() {
    this.host.requestUpdate();
    this.triggerLedgerSync();
  }

  triggerLedgerSync() {
    if (this.ledgerSyncSubscription) {
      return;
    }

    this.ledgerSyncSubscription = this.core.connectToLedgerSync().subscribe({
      next: (value: LedgerSyncAuthenticateResponse) => {
        switch (true) {
          case this.isAuthContext(value):
            this.host.requestUpdate();
            break;
          case this.isUserInteractionNeededResponse(value):
            this.animation = this.mapUserInteractionToDeviceAnimation(
              value.requiredUserInteraction,
            );
            this.host.requestUpdate();
            break;
          case value instanceof LedgerSyncAuthenticationError:
            console.debug("LedgerSyncAuthenticationError", { value });
            this.navigation.navigateTo(this.destinations.turnOnSync);
            break;
        }
      },
      error: (error) => {
        if (error instanceof LedgerSyncConnectionFailedError) {
          console.debug("LedgerSyncConnectionFailedError", { error });
          this.errorData = {
            title:
              this.lang.currentTranslation.error.ledgerSync.ConnectionFailed
                .title,
            message:
              this.lang.currentTranslation.error.ledgerSync.ConnectionFailed
                .description,
            cta1: {
              label:
                this.lang.currentTranslation.error.ledgerSync.ConnectionFailed
                  .cta1,
              action: () => {
                window.close();
              },
            },
            cta2: {
              label:
                this.lang.currentTranslation.error.ledgerSync.ConnectionFailed
                  .cta2,
              action: () => {
                window.open(
                  "https://support.ledger.com/article/16257083527325-zd",
                  "_blank",
                  "noopener,noreferrer",
                );
              },
            },
          };

          this.host.requestUpdate();
        }
      },
    });
  }

  private isUserInteractionNeededResponse(
    value: LedgerSyncAuthenticateResponse,
  ): value is UserInteractionNeededResponse {
    return "requiredUserInteraction" in value;
  }

  private isAuthContext(
    value: LedgerSyncAuthenticateResponse,
  ): value is AuthContext {
    return "trustChainId" in value && "applicationPath" in value;
  }
}
