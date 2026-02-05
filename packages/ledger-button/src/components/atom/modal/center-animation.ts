import { animate } from "motion";

import { ANIMATION_DELAY } from "../../../shared/navigation.js";
import {
  type AnimationInstance,
  type ContainerAnimation,
} from "./animation-types.js";

export class CenterAnimation implements ContainerAnimation {
  private animation: AnimationInstance | null = null;

  open(container: HTMLElement): void {
    this.cancel();

    this.animation = animate(
      container,
      { opacity: 1 },
      { duration: ANIMATION_DELAY / 1000, ease: "easeOut" },
    );
  }

  async close(container: HTMLElement): Promise<void> {
    this.cancel();

    await new Promise<void>((resolve) => {
      this.animation = animate(
        container,
        { opacity: 0 },
        {
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
