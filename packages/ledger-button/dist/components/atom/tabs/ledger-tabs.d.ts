import { LitElement } from 'lit';
export type TabItem = {
    id: string;
    label: string;
};
export type TabChangeEventDetail = {
    selectedId: string;
    previousId: string;
    timestamp: number;
};
export interface LedgerTabsAttributes {
    tabs?: TabItem[];
    selectedId?: string;
}
export declare class LedgerTabs extends LitElement {
    tabs: TabItem[];
    selectedId: string;
    private handleTabClick;
    private handleKeydown;
    private renderTab;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-tabs": LedgerTabs;
    }
    interface WindowEventMap {
        "tab-change": CustomEvent<TabChangeEventDetail>;
    }
}
export default LedgerTabs;
//# sourceMappingURL=ledger-tabs.d.ts.map