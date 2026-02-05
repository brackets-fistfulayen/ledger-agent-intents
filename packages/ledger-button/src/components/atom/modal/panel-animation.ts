import { animate } from "motion";

import { ANIMATION_DELAY } from "../../../shared/navigation.js";
import {
  type AnimationInstance,
  type ContainerAnimation,
  SPRING_CONFIG,
} from "./animation-types.js";

export class PanelAnimation implements ContainerAnimation {
  private animation: AnimationInstance | null = null;

  open(container: HTMLElement): void {
    this.cancel();

    this.animation = animate(
      container,
      { x: 0 },
      {
        ...SPRING_CONFIG,
        duration: ANIMATION_DELAY / 1000,
      },
    );
  }

  async close(container: HTMLElement): Promise<void> {
    this.cancel();

    await new Promise<void>((resolve) => {
      this.animation = animate(
        container,
        { x: "calc(100% + 32px)" },
        {
          ...SPRING_CONFIG,
          duration: ANIMATION_DELAY / 1000,
          onComplete: () => resolve(),
        },
      );
    });

    this.animation = null;
  }

  cancel(): void {
    if (this.animation) {
      this.animation.cancel();
      this.animation = null;
    }
  }
}
