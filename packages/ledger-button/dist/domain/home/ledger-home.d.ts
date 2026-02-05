import { LitElement } from 'lit';
import { AccountItemClickEventDetail } from '../../components/molecule/account-item/ledger-account-item.js';
import { WalletTransactionFeature } from '../../components/molecule/wallet-actions/ledger-wallet-actions.js';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
import { LedgerHomeController } from './ledger-home-controller.js';
export declare class LedgerHomeScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    walletTransactionFeatures?: WalletTransactionFeature[];
    coreContext: CoreContext;
    languages: LanguageContext;
    private activeTab;
    private showRedirectDrawer;
    private currentAction;
    controller: LedgerHomeController;
    connectedCallback(): void;
    private handleAccountItemClick;
    private handleDisconnectClick;
    private handleTabChange;
    private handleWalletActionClick;
    private handleRedirectConfirm;
    private handleRedirectCancel;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-home-screen": LedgerHomeScreen;
    }
    interface WindowEventMap {
        "ledger-internal-button-disconnect": CustomEvent<void>;
        "ledger-internal-account-switch": CustomEvent<AccountItemClickEventDetail>;
    }
}
//# sourceMappingURL=ledger-home.d.ts.map