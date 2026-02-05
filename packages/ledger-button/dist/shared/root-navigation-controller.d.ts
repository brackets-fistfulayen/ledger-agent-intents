import { Account, SignRawTransactionParams, SignTransactionParams } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { CoreContext } from '../context/core-context.js';
import { Translation } from '../context/language-context.js';
import { Navigation } from './navigation.js';
import { Destination, Destinations } from './routes.js';
export declare class RootNavigationController implements ReactiveController {
    private readonly host;
    private readonly core;
    private readonly modalContent;
    navigation: Navigation;
    isModalOpen: boolean;
    destinations: Destinations;
    pendingTransactionParams?: SignRawTransactionParams | SignTransactionParams;
    params?: unknown;
    constructor(host: ReactiveControllerHost, core: CoreContext, translation: Translation, modalContent: HTMLElement);
    hostConnected(): void;
    get currentScreen(): Destination;
    computeInitialState(): Promise<void>;
    navigationIntent(route: Destination["name"], params: unknown): void;
    handleModalOpen(): Promise<void>;
    handleModalClose(): Promise<void>;
    handleChipClick(): Promise<void>;
    navigateToSettings(): void;
    selectAccount(account: Account): void;
    navigateBack(): void;
    get selectedAccount(): Account;
}
//# sourceMappingURL=root-navigation-controller.d.ts.map