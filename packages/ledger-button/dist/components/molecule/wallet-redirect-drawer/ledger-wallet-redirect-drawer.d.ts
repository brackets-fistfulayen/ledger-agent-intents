import { LitElement } from 'lit';
import { LanguageContext } from '../../../context/language-context.js';
import { WalletTransactionFeature } from '../wallet-actions/ledger-wallet-actions.js';
export type WalletRedirectConfirmEventDetail = {
    action: WalletTransactionFeature;
    timestamp: number;
};
export type WalletRedirectCancelEventDetail = {
    action: WalletTransactionFeature;
    timestamp: number;
};
export interface LedgerWalletRedirectDrawerAttributes {
    action: WalletTransactionFeature;
}
export declare class LedgerWalletRedirectDrawer extends LitElement {
    action: WalletTransactionFeature;
    languages: LanguageContext;
    private drawerElement;
    private handleConfirm;
    private handleDrawerClose;
    private handleDownload;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-wallet-redirect-drawer": LedgerWalletRedirectDrawer;
    }
    interface WindowEventMap {
        "wallet-redirect-confirm": CustomEvent<WalletRedirectConfirmEventDetail>;
        "wallet-redirect-cancel": CustomEvent<WalletRedirectCancelEventDetail>;
    }
}
export default LedgerWalletRedirectDrawer;
//# sourceMappingURL=ledger-wallet-redirect-drawer.d.ts.map