import { LitElement } from 'lit';
export interface LedgerIconAttributes {
    type: "ledger" | "back" | "close" | "bluetooth" | "usb" | "chevronRight" | "chevronDown" | "check" | "error" | "device" | "mobile" | "desktop" | "cart" | "externalLink" | "directConnectivity" | "clearSigning" | "transactionCheck" | "question" | "settings" | "send" | "receive" | "swap" | "buy" | "earn" | "sell" | "info";
    size: "small" | "medium" | "large";
    fillColor?: string;
}
export declare class LedgerIcon extends LitElement {
    type: LedgerIconAttributes["type"];
    size: string;
    fillColor?: string;
    private get iconClasses();
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-icon": LedgerIcon;
    }
}
export default LedgerIcon;
//# sourceMappingURL=ledger-icon.d.ts.map