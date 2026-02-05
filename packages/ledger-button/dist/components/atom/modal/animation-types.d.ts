import { animate } from 'motion';
export type AnimationInstance = ReturnType<typeof animate>;
export declare const SPRING_CONFIG: {
    type: "spring";
    stiffness: number;
    damping: number;
    mass: number;
};
export interface ContainerAnimation {
    open(container: HTMLElement): void;
    close(container: HTMLElement): Promise<void>;
    cancel(): void;
}
//# sourceMappingURL=animation-types.d.ts.map