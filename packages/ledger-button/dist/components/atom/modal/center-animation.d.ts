import { ContainerAnimation } from './animation-types.js';
export declare class CenterAnimation implements ContainerAnimation {
    private animation;
    open(container: HTMLElement): void;
    close(container: HTMLElement): Promise<void>;
    cancel(): void;
}
//# sourceMappingURL=center-animation.d.ts.map