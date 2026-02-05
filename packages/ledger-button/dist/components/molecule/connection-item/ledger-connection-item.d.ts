import { LitElement } from 'lit';
export type ConnectionItemClickEventDetail = {
    title: string;
    connectionType: "bluetooth" | "usb" | "";
    timestamp: number;
};
export interface LedgerConnectionItemAttributes {
    title?: string;
    connectionType?: "bluetooth" | "usb";
    clickable?: boolean;
    disabled?: boolean;
}
export declare class LedgerConnectionItem extends LitElement {
    title: string;
    hint: string;
    connectionType: "bluetooth" | "usb" | "";
    clickable: boolean;
    disabled: boolean;
    private get containerClasses();
    private handleClick;
    private handleKeyDown;
    private renderIcon;
    private renderChevron;
    private renderTitle;
    private renderHint;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-connection-item": LedgerConnectionItem;
    }
}
export default LedgerConnectionItem;
//# sourceMappingURL=ledger-connection-item.d.ts.map