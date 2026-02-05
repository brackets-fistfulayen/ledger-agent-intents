import { ReactiveController, ReactiveControllerHost } from "lit";
import { Subscription } from "rxjs";

import { CoreContext } from "../../../context/core-context.js";

export class FloatingButtonController implements ReactiveController {
  host: ReactiveControllerHost;
  contextSubscription: Subscription | undefined = undefined;
  isConnected = false;

  constructor(
    host: ReactiveControllerHost,
    private readonly core: CoreContext,
  ) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.updateConnectionState();
    this.subscribeToContext();
  }

  hostDisconnected(): void {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  private subscribeToContext() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }

    this.contextSubscription = this.core.observeContext().subscribe(() => {
      this.updateConnectionState();
      this.host.requestUpdate();
    });
  }

  private updateConnectionState() {
    const selectedAccount = this.core.getSelectedAccount();
    this.isConnected =
      selectedAccount !== null && selectedAccount !== undefined;
  }

  get shouldShow(): boolean {
    return this.isConnected;
  }
}
