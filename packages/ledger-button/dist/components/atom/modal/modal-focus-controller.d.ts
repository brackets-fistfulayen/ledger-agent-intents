import { ReactiveController, ReactiveControllerHost } from 'lit';
export declare class ModalFocusController implements ReactiveController {
    private readonly host;
    private previousActiveElement;
    private boundHandleKeydown;
    private onEscapeCallback;
    private containerElement;
    private isActive;
    constructor(host: ReactiveControllerHost);
    hostConnected(): void;
    hostDisconnected(): void;
    activate(container: HTMLElement, onEscape: () => void): void;
    deactivate(): void;
    private handleKeydown;
    private handleTabKey;
    private getFocusableElements;
    private focusFirstElement;
}
//# sourceMappingURL=modal-focus-controller.d.ts.map