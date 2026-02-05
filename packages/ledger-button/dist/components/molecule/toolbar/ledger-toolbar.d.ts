import { LitElement } from 'lit';
import { DeviceModelId } from '../../atom/icon/device-icon/device-icon';
export interface LedgerToolbarAttributes {
    title?: string;
    deviceModelId?: DeviceModelId;
    canGoBack: boolean;
    canClose: boolean;
    showSettings: boolean;
}
export declare class LedgerToolbar extends LitElement {
    title: string;
    canClose: boolean;
    canGoBack: boolean;
    deviceModelId?: DeviceModelId;
    showSettings: boolean;
    private handleClose;
    private handleChipClick;
    private handleGoBackClick;
    private handleSettingsClick;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-toolbar": LedgerToolbar;
    }
    interface WindowEventMap {
        "ledger-toolbar-close": CustomEvent<void>;
        "ledger-toolbar-chip-click": CustomEvent<{
            timestamp: number;
            label: string;
            deviceModelId: DeviceModelId;
        }>;
        "ledger-toolbar-go-back-click": CustomEvent<void>;
        "ledger-toolbar-settings-click": CustomEvent<void>;
    }
}
export default LedgerToolbar;
//# sourceMappingURL=ledger-toolbar.d.ts.map