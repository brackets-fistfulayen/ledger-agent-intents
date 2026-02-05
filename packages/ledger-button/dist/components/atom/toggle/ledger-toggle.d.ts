import { LitElement } from 'lit';
export interface LedgerToggleAttributes {
    checked: boolean;
    disabled: boolean;
}
export declare class LedgerToggle extends LitElement {
    checked: boolean;
    disabled: boolean;
    private handleClick;
    private handleKeyDown;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-toggle": LedgerToggle;
    }
    interface WindowEventMap {
        "ledger-toggle-change": CustomEvent<{
            checked: boolean;
        }>;
    }
}
export default LedgerToggle;
//# sourceMappingURL=ledger-toggle.d.ts.map