import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subscription } from 'rxjs';
import { CoreContext } from '../../../context/core-context.js';
export declare class FloatingButtonController implements ReactiveController {
    private readonly core;
    host: ReactiveControllerHost;
    contextSubscription: Subscription | undefined;
    isConnected: boolean;
    constructor(host: ReactiveControllerHost, core: CoreContext);
    hostConnected(): void;
    hostDisconnected(): void;
    private subscribeToContext;
    private updateConnectionState;
    get shouldShow(): boolean;
}
//# sourceMappingURL=ledger-floating-button-controller.d.ts.map