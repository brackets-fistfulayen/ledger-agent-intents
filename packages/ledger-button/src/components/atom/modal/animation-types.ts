import { animate } from "motion";

export type AnimationInstance = ReturnType<typeof animate>;

export const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 240,
  damping: 40,
  mass: 1,
};

export interface ContainerAnimation {
  open(container: HTMLElement): void;
  close(container: HTMLElement): Promise<void>;
  cancel(): void;
}
