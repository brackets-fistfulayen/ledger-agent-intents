import { LitElement } from 'lit';
export type DrawerCloseEventDetail = {
    timestamp: number;
};
export interface LedgerDrawerAttributes {
    showCloseButton: boolean;
}
/**
 * A reusable drawer component that slides up from the bottom of its container.
 *
 * @fires drawer-close - Fired when the drawer is closed (via backdrop click or close button)
 *
 * @slot - Default slot for the drawer content
 *
 * @example
 * ```html
 * <ledger-drawer @drawer-close=${this.handleClose}>
 *   <div>Your content here</div>
 * </ledger-drawer>
 * ```
 */
export declare class LedgerDrawer extends LitElement {
    /**
     * Whether to show the close button in the top-right corner.
     * @default true
     */
    showCloseButton: boolean;
    private backdropElement;
    private containerElement;
    private backdropAnimation;
    private containerAnimation;
    private isClosing;
    firstUpdated(): void;
    disconnectedCallback(): void;
    /**
     * Programmatically close the drawer with animation.
     * Dispatches 'drawer-close' event after animation completes.
     */
    close(): Promise<void>;
    private animateOpen;
    private animateClose;
    private cancelAnimations;
    private handleClose;
    private renderCloseButton;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-drawer": LedgerDrawer;
    }
    interface WindowEventMap {
        "drawer-close": CustomEvent<DrawerCloseEventDetail>;
    }
}
export default LedgerDrawer;
//# sourceMappingURL=ledger-drawer.d.ts.map