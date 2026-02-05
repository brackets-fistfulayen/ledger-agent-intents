import { LedgerButtonCore } from "@ledgerhq/ledger-wallet-provider-core";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Subscription } from "rxjs";

export class OnboardingFlowController implements ReactiveController {
  host: ReactiveControllerHost;
  state: OnboardingFlowState = "welcome";
  contextSubscription: Subscription | undefined = undefined;

  constructor(
    host: ReactiveControllerHost,
    private readonly core: LedgerButtonCore,
  ) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.host.requestUpdate();
    this.computeCurrentState();
  }

  hostDisconnected(): void {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  computeCurrentState() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }

    this.contextSubscription = this.core
      .observeContext()
      .subscribe((context) => {
        if (!context.welcomeScreenCompleted) {
          this.state = "welcome";
        }
        else if (context.hasTrackingConsent === undefined) {
          this.state = "consent-analytics";
        }
        else if (context.trustChainId && context.applicationPath) {
          this.state = "retrieving-accounts";
        } else if (
          (context.trustChainId && !context.applicationPath) ||
          context.connectedDevice
        ) {
          this.state = "ledger-sync";
        } else {
          this.state = "select-device";
        }

        this.host.requestUpdate();
      });
  }
}

type OnboardingFlowState =
  | "welcome"
  | "consent-analytics"
  | "select-device"
  | "ledger-sync"
  | "select-account"
  | "retrieving-accounts";
