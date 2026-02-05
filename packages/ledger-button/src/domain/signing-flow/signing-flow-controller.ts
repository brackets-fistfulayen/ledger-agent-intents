import { LedgerButtonCore } from "@ledgerhq/ledger-wallet-provider-core";
import { ReactiveController, ReactiveControllerHost } from "lit";
import { Subscription } from "rxjs";

export class SigningFlowController implements ReactiveController {
  host: ReactiveControllerHost;
  state: SigningFlowState = "select-device";
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
        if (context.connectedDevice) {
          this.state = "sign-transaction";
        } else {
          this.state = "select-device";
        }

        this.host.requestUpdate();
      });
  }
}

type SigningFlowState = "select-device" | "sign-transaction";
