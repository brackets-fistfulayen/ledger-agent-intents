import { LitElement } from 'lit';
import { DeviceModelId } from '../../atom/icon/device-icon/device-icon';
export type DeviceStatus = "connected" | "available";
export type DeviceItemClickEventDetail = {
    deviceId: string;
    title: string;
    connectionType: "bluetooth" | "usb" | "";
    status: DeviceStatus;
    timestamp: number;
};
export interface LedgerDeviceItemAttributes {
    deviceId?: string;
    title?: string;
    connectionType?: "bluetooth" | "usb";
    deviceModelId?: DeviceModelId;
    status?: DeviceStatus;
    clickable?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    connectedText?: string;
    availableText?: string;
}
export declare class LedgerDeviceItem extends LitElement {
    deviceId: string;
    title: string;
    connectionType: "bluetooth" | "usb" | "";
    deviceModelId: DeviceModelId;
    status: DeviceStatus;
    clickable: boolean;
    disabled: boolean;
    connectedText: string;
    availableText: string;
    private get containerClasses();
    private get statusClasses();
    private handleClick;
    private handleKeyDown;
    private renderDeviceIcon;
    private renderTitle;
    private renderStatus;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-device-item": LedgerDeviceItem;
    }
}
export default LedgerDeviceItem;
//# sourceMappingURL=ledger-device-item.d.ts.map