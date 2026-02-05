import { LitElement } from 'lit';
export type DeviceType = "nanox" | "stax" | "flex" | "apexp";
export interface LedgerInfoStateAttributes {
    device: DeviceType;
    title: string;
    subtitle?: string;
}
export declare class LedgerInfoState extends LitElement {
    device: DeviceType;
    title: string;
    subtitle: string;
    private renderDeviceIcon;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-info-state": LedgerInfoState;
    }
}
export default LedgerInfoState;
//# sourceMappingURL=ledger-info-state.d.ts.map