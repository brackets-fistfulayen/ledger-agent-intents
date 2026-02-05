import { LitElement } from 'lit';
import { LedgerIconAttributes } from '../icon/ledger-icon.js';
export type ButtonVariant = "primary" | "secondary" | "accent" | "noBackground";
export type ButtonSize = "small" | "medium" | "large" | "xs" | "full";
export type IconPosition = "left" | "right";
export interface LedgerButtonAttributes {
    label?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    icon?: boolean;
    iconPosition?: IconPosition;
    type?: "button" | "submit" | "reset";
}
export declare class LedgerButton extends LitElement {
    label: string;
    variant: ButtonVariant;
    size: ButtonSize;
    disabled: boolean;
    icon: boolean;
    iconType?: LedgerIconAttributes["type"];
    iconPosition: IconPosition;
    type: "button" | "submit" | "reset";
    private get buttonClasses();
    private renderIcon;
    private renderLabel;
    render(): import('lit').TemplateResult<1>;
    private handleClick;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-button": LedgerButton;
    }
    interface WindowEventMap {
        "ledger-button-click": CustomEvent<{
            timestamp: number;
            variant: ButtonVariant;
            size: ButtonSize;
            label: string;
        }>;
    }
}
export default LedgerButton;
//# sourceMappingURL=ledger-button.d.ts.map