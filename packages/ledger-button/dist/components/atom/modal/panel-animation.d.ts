import { ContainerAnimation } from './animation-types.js';
export declare class PanelAnimation implements ContainerAnimation {
    private animation;
    open(container: HTMLElement): void;
    close(container: HTMLElement): Promise<void>;
    cancel(): void;
}
//# sourceMappingURL=panel-animation.d.ts.map