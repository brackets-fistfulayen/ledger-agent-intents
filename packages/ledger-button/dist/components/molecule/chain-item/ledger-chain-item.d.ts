import { LitElement } from 'lit';
export type ChainItemType = "token" | "network";
export interface LedgerChainItemAttributes {
    ledgerId: string;
    title: string;
    subtitle: string;
    ticker: string;
    value: string;
    isClickable: boolean;
    type: ChainItemType;
}
export declare class LedgerChainItem extends LitElement {
    ledgerId: string;
    title: string;
    subtitle: string;
    ticker: string;
    value: string;
    isClickable: boolean;
    type: ChainItemType;
    private get containerClasses();
    private handleItemClick;
    private handleItemKeyDown;
    private renderLeftSection;
    private renderRightSection;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-chain-item": LedgerChainItem;
    }
}
export default LedgerChainItem;
//# sourceMappingURL=ledger-chain-item.d.ts.map