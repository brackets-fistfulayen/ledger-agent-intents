import { LedgerButtonCore } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subscription } from 'rxjs';
export declare class OnboardingFlowController implements ReactiveController {
    private readonly core;
    host: ReactiveControllerHost;
    state: OnboardingFlowState;
    contextSubscription: Subscription | undefined;
    constructor(host: ReactiveControllerHost, core: LedgerButtonCore);
    hostConnected(): void;
    hostDisconnected(): void;
    computeCurrentState(): void;
}
type OnboardingFlowState = "welcome" | "consent-analytics" | "select-device" | "ledger-sync" | "select-account" | "retrieving-accounts";
export {};
//# sourceMappingURL=onboarding-flow-controller.d.ts.map