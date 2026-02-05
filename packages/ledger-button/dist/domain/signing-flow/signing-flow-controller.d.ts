import { LedgerButtonCore } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subscription } from 'rxjs';
export declare class SigningFlowController implements ReactiveController {
    private readonly core;
    host: ReactiveControllerHost;
    state: SigningFlowState;
    contextSubscription: Subscription | undefined;
    constructor(host: ReactiveControllerHost, core: LedgerButtonCore);
    hostConnected(): void;
    hostDisconnected(): void;
    computeCurrentState(): void;
}
type SigningFlowState = "select-device" | "sign-transaction";
export {};
//# sourceMappingURL=signing-flow-controller.d.ts.map