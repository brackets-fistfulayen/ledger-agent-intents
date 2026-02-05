import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
export declare class TurnOnSyncDesktopController implements ReactiveController {
    private readonly navigation;
    private readonly destinations;
    host: ReactiveControllerHost;
    constructor(host: ReactiveControllerHost, navigation: Navigation, destinations: Destinations);
    hostConnected(): void;
    handleTurnOnLedgerSync(): void;
    handleLedgerSyncActivated(): void;
}
//# sourceMappingURL=turn-on-sync-desktop-controller.d.ts.map