import { LitElement } from 'lit';
import { WalletTransactionFeature } from '../../components/molecule/wallet-actions/ledger-wallet-actions.js';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
import { HomeFlowController } from './home-flow-controller.js';
export declare class HomeFlow extends LitElement {
    static styles: import('lit').CSSResult;
    navigation: Navigation;
    destinations: Destinations;
    walletTransactionFeatures?: WalletTransactionFeature[];
    coreContext: CoreContext;
    languages: LanguageContext;
    controller: HomeFlowController;
    connectedCallback(): void;
    render(): import('lit').TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "home-flow": HomeFlow;
    }
}
//# sourceMappingURL=home-flow.d.ts.map