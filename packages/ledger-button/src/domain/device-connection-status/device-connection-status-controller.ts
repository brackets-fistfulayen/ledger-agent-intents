import { CoreContext } from "../../context/core-context.js";
import { Navigation } from "../../shared/navigation.js";
import { Destinations } from "../../shared/routes.js";

export class DeviceConnectionStatusController {
  constructor(
    private readonly coreContext: CoreContext,
    private readonly navigation: Navigation,
    private readonly destinations: Destinations,
  ) {}

  hostConnected() {
    this.monitorConnectionStatus();
  }

  private async monitorConnectionStatus() {
    const connectedDevice = this.coreContext.getConnectedDevice();

    if (connectedDevice) {
      await this.handleSuccessfulConnection();
      return;
    }

    const checkConnection = setInterval(async () => {
      const device = this.coreContext.getConnectedDevice();

      if (device) {
        clearInterval(checkConnection);
        await this.handleSuccessfulConnection();
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(checkConnection);
      this.handleConnectionTimeout();
    }, 30000);
  }

  private async handleSuccessfulConnection() {
    const pendingTransactionParams =
      this.coreContext.getPendingTransactionParams();

    if (pendingTransactionParams) {
      this.navigation.navigateTo(this.destinations.signTransaction);
    } else {
      this.navigation.navigateTo(this.destinations.ledgerSync);
    }
  }

  private handleConnectionTimeout() {
    this.navigation.navigateTo(this.destinations.onboardingFlow);
  }
}
