import { DetailedAccount } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Subscription } from 'rxjs';
import { CoreContext } from '../../context/core-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
export declare class LedgerHomeController implements ReactiveController {
    private readonly host;
    private readonly core;
    private readonly navigation;
    private readonly destinations;
    selectedAccount: DetailedAccount | undefined;
    loading: boolean;
    contextSubscription: Subscription | undefined;
    private currentFetchId;
    constructor(host: ReactiveControllerHost, core: CoreContext, navigation: Navigation, destinations: Destinations);
    getSelectedAccount(): Promise<void>;
    startListeningToContextChanges(): void;
    private handleAccountsUpdated;
    hostConnected(): void;
    hostDisconnected(): void;
}
//# sourceMappingURL=ledger-home-controller.d.ts.map