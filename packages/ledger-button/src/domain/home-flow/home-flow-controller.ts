import { LedgerButtonCore } from "@ledgerhq/ledger-wallet-provider-core";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Subscription } from "rxjs";

import { Navigation } from "../../shared/navigation.js";
import { Destinations } from "../../shared/routes.js";

export class HomeFlowController implements ReactiveController {
  host: ReactiveControllerHost;
  state: HomeFlowState = "ledger-home";
  contextSubscription: Subscription | undefined = undefined;

  constructor(
    host: ReactiveControllerHost,
    private readonly core: LedgerButtonCore,
    private readonly navigation: Navigation,
    private readonly destinations: Destinations,
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
        if (context.hasTrackingConsent === undefined) {
          this.state = "consent-analytics";
        } else if (context.selectedAccount) {
          this.state = "ledger-home";
        } else {
          this.navigation.navigateTo(this.destinations.onboardingFlow);
        }

        this.host.requestUpdate();
      });
  }
}

type HomeFlowState = "ledger-home" | "consent-analytics";
