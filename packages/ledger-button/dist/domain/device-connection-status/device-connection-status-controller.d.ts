import { CoreContext } from '../../context/core-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
export declare class DeviceConnectionStatusController {
    private readonly coreContext;
    private readonly navigation;
    private readonly destinations;
    constructor(coreContext: CoreContext, navigation: Navigation, destinations: Destinations);
    hostConnected(): void;
    private monitorConnectionStatus;
    private handleSuccessfulConnection;
    private handleConnectionTimeout;
}
//# sourceMappingURL=device-connection-status-controller.d.ts.map