import { LitElement, nothing } from 'lit';
import { LanguageContext } from '../../../context/language-context.js';
export type WalletTransactionFeature = "send" | "receive" | "swap" | "buy" | "earn" | "sell";
export type WalletActionClickEventDetail = {
    action: WalletTransactionFeature;
    timestamp: number;
};
export interface LedgerWalletActionsAttributes {
    features?: WalletTransactionFeature[];
}
export declare class LedgerWalletActions extends LitElement {
    features: WalletTransactionFeature[];
    languages: LanguageContext;
    private handleActionClick;
    private getActionLabel;
    private renderActionButton;
    private renderRow;
    render(): import('lit').TemplateResult<1> | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-wallet-actions": LedgerWalletActions;
    }
}
export default LedgerWalletActions;
//# sourceMappingURL=ledger-wallet-actions.d.ts.map