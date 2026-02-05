import { LitElement, nothing } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
export type FloatingButtonPosition = "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "top-center";
export type FloatingButtonVariant = "circular" | "compact";
export declare class LedgerFloatingButton extends LitElement {
    private coreContext;
    core?: CoreContext;
    position: FloatingButtonPosition;
    variant: FloatingButtonVariant;
    private controller;
    private get floatingButtonClasses();
    connectedCallback(): void;
    updated(): void;
    private handleClick;
    render(): import('lit').TemplateResult<1> | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-floating-button": LedgerFloatingButton;
    }
}
//# sourceMappingURL=ledger-floating-button.d.ts.map