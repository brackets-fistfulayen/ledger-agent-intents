import { ReactiveController, ReactiveControllerHost } from 'lit';
export declare class ModalScrollLockController implements ReactiveController {
    private readonly host;
    private previousOverflow;
    private isLocked;
    constructor(host: ReactiveControllerHost);
    hostDisconnected(): void;
    lock(): void;
    unlock(): void;
}
//# sourceMappingURL=modal-scroll-lock-controller.d.ts.map