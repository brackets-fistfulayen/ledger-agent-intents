import { Account, LedgerButtonCore, SignedResults } from '@ledgerhq/ledger-wallet-provider-core';
import { LitElement } from 'lit';
import { FloatingButtonPosition as FloatingButtonPositionComponent } from './components/atom/floating-button/ledger-floating-button.js';
import { ModalMode } from './components/index.js';
import { WalletTransactionFeature } from './components/molecule/wallet-actions/ledger-wallet-actions.js';
import { RootNavigationComponent } from './shared/root-navigation.js';
import { Destination } from './shared/routes.js';
import { LedgerButtonAppController } from './ledger-button-app-controller.js';
type FloatingButtonPosition = FloatingButtonPositionComponent | false;
export declare class LedgerButtonApp extends LitElement {
    root: RootNavigationComponent;
    core: LedgerButtonCore;
    floatingButtonPosition: FloatingButtonPosition;
    walletTransactionFeatures?: WalletTransactionFeature[];
    controller: LedgerButtonAppController;
    connectedCallback(): void;
    get isModalOpen(): boolean;
    disconnectedCallback(): void;
    private handleAccountSelected;
    private handleSign;
    private handleLedgerButtonDisconnect;
    private handleAccountSwitch;
    private handleFloatingButtonClick;
    navigationIntent(intent: Destination["name"], params?: unknown, mode?: ModalMode): void;
    disconnect(): void;
    openModal(): void;
    private renderFloatingButton;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-button-app": LedgerButtonApp;
    }
    interface WindowEventMap {
        "ledger-provider-account-selected": CustomEvent<{
            account: Account;
            status: "success";
        } | {
            status: "error";
            error: unknown;
        }>;
        "ledger-provider-sign": CustomEvent<{
            status: "success";
            data: SignedResults;
        } | {
            status: "error";
            error: unknown;
        }>;
        "ledger-provider-disconnect": CustomEvent;
    }
}
export {};
//# sourceMappingURL=ledger-button-app.d.ts.map