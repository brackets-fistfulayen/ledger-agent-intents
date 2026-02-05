import { ReactiveController, ReactiveControllerHost } from 'lit';
export type ModalMode = "center" | "panel";
type AnimationElements = {
    backdrop: HTMLElement;
    container: HTMLElement;
    wrapper: HTMLElement;
};
export declare class ModalAnimationController implements ReactiveController {
    private readonly host;
    private backdropAnimation;
    private centerAnimation;
    private panelAnimation;
    constructor(host: ReactiveControllerHost);
    hostDisconnected(): void;
    animateOpen(elements: AnimationElements, mode: ModalMode): void;
    animateClose(elements: AnimationElements, mode: ModalMode): Promise<void>;
    cancelAnimations(): void;
}
export {};
//# sourceMappingURL=modal-animation-controller.d.ts.map