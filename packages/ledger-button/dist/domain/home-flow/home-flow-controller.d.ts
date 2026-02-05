import { LedgerButtonCore } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subscription } from 'rxjs';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
export declare class HomeFlowController implements ReactiveController {
    private readonly core;
    private readonly navigation;
    private readonly destinations;
    host: ReactiveControllerHost;
    state: HomeFlowState;
    contextSubscription: Subscription | undefined;
    constructor(host: ReactiveControllerHost, core: LedgerButtonCore, navigation: Navigation, destinations: Destinations);
    hostConnected(): void;
    hostDisconnected(): void;
    computeCurrentState(): void;
}
type HomeFlowState = "ledger-home" | "consent-analytics";
export {};
//# sourceMappingURL=home-flow-controller.d.ts.map