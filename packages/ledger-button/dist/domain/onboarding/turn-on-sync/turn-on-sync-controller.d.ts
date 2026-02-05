import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
export declare class TurnOnSyncController implements ReactiveController {
    private readonly navigation;
    private readonly destinations;
    host: ReactiveControllerHost;
    constructor(host: ReactiveControllerHost, navigation: Navigation, destinations: Destinations);
    hostConnected(): void;
    handleTurnOnSyncOnMobile(): void;
    handleTurnOnSyncOnDesktop(): void;
    handleLearnMore(): void;
}
//# sourceMappingURL=turn-on-sync-controller.d.ts.map