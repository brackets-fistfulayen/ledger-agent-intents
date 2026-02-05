import { LitElement } from 'lit';
import { ModalMode } from './modal-animation-controller.js';
export type { ModalMode };
export declare class LedgerModal extends LitElement {
    mode: ModalMode;
    private isClosing;
    private wrapperElement;
    private backdropElement;
    private containerElement;
    private animationController;
    private focusController;
    private scrollLockController;
    openModal(mode?: ModalMode): void;
    closeModal(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleOpen;
    private handleClose;
    private dispatchAnimationComplete;
    private renderBackdrop;
    private renderToolbar;
    private renderContent;
    private renderCenterContainer;
    private renderPanelContainer;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-modal": LedgerModal;
    }
    interface WindowEventMap {
        "modal-opened": CustomEvent<void>;
        "modal-closed": CustomEvent<void>;
        "modal-animation-complete": CustomEvent<void>;
    }
}
//# sourceMappingURL=ledger-modal.d.ts.map