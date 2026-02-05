import { LitElement } from 'lit';
import { DeviceModelId } from '../icon/device-icon/device-icon';
export interface LedgerChipAttributes {
    label?: string;
    icon?: "device";
}
export declare class LedgerChip extends LitElement {
    label: string;
    deviceModelId: DeviceModelId;
    private get chipContainerClasses();
    private get chipLabelClasses();
    private get chipChevronClasses();
    private renderIcon;
    private renderChevron;
    render(): import('lit').TemplateResult<1>;
    private handleClick;
    private handleKeydown;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-chip": LedgerChip;
    }
    interface WindowEventMap {
        "ledger-chip-click": CustomEvent<{
            timestamp: number;
            label: string;
            deviceModelId: DeviceModelId;
        }>;
    }
}
export default LedgerChip;
//# sourceMappingURL=ledger-chip.d.ts.map