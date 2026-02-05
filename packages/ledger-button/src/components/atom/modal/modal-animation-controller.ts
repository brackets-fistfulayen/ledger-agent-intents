import { ReactiveController, ReactiveControllerHost } from "lit";
import { animate } from "motion";

import { ANIMATION_DELAY } from "../../../shared/navigation.js";
import { type AnimationInstance } from "./animation-types.js";
import { CenterAnimation } from "./center-animation.js";
import { PanelAnimation } from "./panel-animation.js";

export type ModalMode = "center" | "panel";

type AnimationElements = {
  backdrop: HTMLElement;
  container: HTMLElement;
  wrapper: HTMLElement;
};

export class ModalAnimationController implements ReactiveController {
  private backdropAnimation: AnimationInstance | null = null;
  private centerAnimation = new CenterAnimation();
  private panelAnimation = new PanelAnimation();

  constructor(private readonly host: ReactiveControllerHost) {
    this.host.addController(this);
  }

  hostDisconnected(): void {
    this.cancelAnimations();
  }

  animateOpen(elements: AnimationElements, mode: ModalMode): void {
    this.cancelAnimations();

    elements.wrapper.classList.add("modal-wrapper--open");

    this.backdropAnimation = animate(
      elements.backdrop,
      { opacity: [0, 1] },
      { duration: ANIMATION_DELAY / 1000, ease: "easeOut" },
    );

    if (mode === "panel") {
      this.panelAnimation.open(elements.container);
    } else {
      this.centerAnimation.open(elements.container);
    }
  }

  async animateClose(
    elements: AnimationElements,
    mode: ModalMode,
  ): Promise<void> {
    const animations: Promise<void>[] = [];

    if (mode === "panel") {
      animations.push(this.panelAnimation.close(elements.container));
    } else {
      animations.push(this.centerAnimation.close(elements.container));
    }

    animations.push(
      new Promise<void>((resolve) => {
        this.backdropAnimation = animate(
          elements.backdrop,
          { opacity: [1, 0] },
          {
            duration: ANIMATION_DELAY / 1000,
            onComplete: () => resolve(),
          },
        );
      }),
    );

    await Promise.all(animations);

    elements.wrapper.classList.remove("modal-wrapper--open");
    this.backdropAnimation = null;
  }

  cancelAnimations(): void {
    if (this.backdropAnimation) {
      this.backdropAnimation.cancel();
      this.backdropAnimation = null;
    }

    this.centerAnimation.cancel();
    this.panelAnimation.cancel();
  }
}
