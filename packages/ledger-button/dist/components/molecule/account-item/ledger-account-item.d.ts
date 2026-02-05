import { LitElement } from 'lit';
export type AccountItemClickEventDetail = {
    title: string;
    address: string;
    ticker: string;
    ledgerId: string;
    balance: string | undefined;
    linkLabel: string;
    timestamp: number;
    currencyId: string;
};
export interface LedgerAccountItemMoleculeAttributes {
    title: string;
    address: string;
    ticker: string;
    ledgerId: string;
    balance: string | undefined;
    linkLabel: string;
}
export declare class LedgerAccountItemMolecule extends LitElement {
    title: string;
    address: string;
    ticker: string;
    ledgerId: string;
    balance: string | undefined;
    linkLabel: string;
    private get isBalanceLoading();
    tokens: number;
    currencyId: string;
    private get containerClasses();
    private handleAccountClick;
    private handleAccountKeyDown;
    private handleShowTokens;
    private formatAddress;
    private renderAccountInfo;
    private renderValueInfo;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-account-item": LedgerAccountItemMolecule;
    }
    interface WindowEventMap {
        "account-item-click": CustomEvent<AccountItemClickEventDetail>;
        "account-item-show-tokens-click": CustomEvent<AccountItemClickEventDetail>;
    }
}
export default LedgerAccountItemMolecule;
//# sourceMappingURL=ledger-account-item.d.ts.map