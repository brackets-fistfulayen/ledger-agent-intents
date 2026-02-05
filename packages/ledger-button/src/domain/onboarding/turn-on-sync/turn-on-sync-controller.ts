import { ReactiveController, ReactiveControllerHost } from "lit";

import { Navigation } from "../../../shared/navigation.js";
import { Destinations } from "../../../shared/routes.js";

export class TurnOnSyncController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(
    host: ReactiveControllerHost,
    private readonly navigation: Navigation,
    private readonly destinations: Destinations,
  ) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.host.requestUpdate();
  }

  handleTurnOnSyncOnMobile() {
    this.navigation.navigateTo(this.destinations.turnOnSyncMobile);
  }

  handleTurnOnSyncOnDesktop() {
    this.navigation.navigateTo(this.destinations.turnOnSyncDesktop);
  }

  handleLearnMore() {
    window
      .open(
        "https://support.ledger.com/article/How-to-synchronize-your-Ledger-Live-accounts-with-Ledger-Sync",
        "_blank",
      )
      ?.focus();
  }
}
