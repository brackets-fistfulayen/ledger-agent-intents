import { Account } from '@ledgerhq/ledger-wallet-provider-core';
import { LitElement } from 'lit';
import { ModalMode } from '../components/atom/modal/ledger-modal.js';
import { WalletTransactionFeature } from '../components/molecule/wallet-actions/ledger-wallet-actions.js';
import { CoreContext } from '../context/core-context.js';
import { LanguageContext } from '../context/language-context.js';
import { RootNavigationController } from './root-navigation-controller.js';
import { Destination } from './routes.js';
export declare class RootNavigationComponent extends LitElement {
    coreContext: CoreContext;
    languageContext: LanguageContext;
    walletTransactionFeatures?: WalletTransactionFeature[];
    private ledgerModal;
    private modalContent;
    rootNavigationController: RootNavigationController;
    isModalOpen: boolean;
    connectedCallback(): void;
    openModal(mode?: ModalMode): void;
    closeModal(): void;
    selectAccount(account: Account): void;
    getSelectedAccount(): Account;
    getModalMode(): ModalMode;
    navigateToHome(): void;
    navigationIntent(intent: Destination["name"], params?: unknown, mode?: ModalMode): void;
    private handleModalOpen;
    private handleModalClose;
    private handleModalAnimationComplete;
    private handleChipClick;
    private handleSettingsClick;
    private goBack;
    private renderScreen;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "root-navigation-component": RootNavigationComponent;
    }
    interface WindowEventMap {
        "ledger-provider-close": CustomEvent;
        "ledger-core-modal-open": CustomEvent;
        "ledger-core-modal-close": CustomEvent;
    }
}
//# sourceMappingURL=root-navigation.d.ts.map