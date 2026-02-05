import { Device } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subscription } from 'rxjs';
import { AnimationKey } from '../../../components/molecule/device-animation/device-animation.js';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
export declare class LedgerSyncController implements ReactiveController {
    private readonly host;
    private readonly core;
    private readonly navigation;
    private readonly destinations;
    private readonly lang;
    device?: Device;
    animation: Omit<AnimationKey, "pairing" | "pairingSuccess" | "frontView">;
    ledgerSyncSubscription: Subscription | undefined;
    errorData?: {
        message: string;
        title: string;
        cta1?: {
            label: string;
            action: () => void;
        };
        cta2?: {
            label: string;
            action: () => void;
        };
    };
    constructor(host: ReactiveControllerHost, core: CoreContext, navigation: Navigation, destinations: Destinations, lang: LanguageContext);
    hostConnected(): void;
    private mapUserInteractionToDeviceAnimation;
    getConnectedDevice(): Promise<void>;
    triggerLedgerSync(): void;
    private isUserInteractionNeededResponse;
    private isAuthContext;
}
//# sourceMappingURL=ledger-sync-controller.d.ts.map