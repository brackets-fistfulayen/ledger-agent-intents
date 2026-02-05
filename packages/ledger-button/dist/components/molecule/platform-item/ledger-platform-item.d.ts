import { LitElement } from 'lit';
export type PlatformItemClickEventDetail = {
    platformType: "mobile" | "desktop";
};
export declare class LedgerPlatformItem extends LitElement {
    title: string;
    platformType: "mobile" | "desktop";
    clickable: boolean;
    disabled: boolean;
    private get containerClasses();
    private handleClick;
    private handleKeyDown;
    private renderPlatformIcon;
    private renderTitle;
    private renderChevron;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-platform-item": LedgerPlatformItem;
    }
}
export default LedgerPlatformItem;
//# sourceMappingURL=ledger-platform-item.d.ts.map