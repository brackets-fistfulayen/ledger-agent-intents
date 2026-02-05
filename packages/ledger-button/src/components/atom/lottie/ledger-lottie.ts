import { cva } from "class-variance-authority";
import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import type { AnimationItem } from "lottie-web";
import lottie from "lottie-web";

import backgroundFlare from "./animations/background-flare.js";
import checkmark from "./animations/checkmark.js";
import loadingSpinner from "./animations/loading-spinner.js";
import { tailwindElement } from "../../../tailwind-element.js";

export type LottieSize = "small" | "medium" | "large" | "full";

const LOTTIE_ANIMATIONS = {
  backgroundFlare,
  checkmark,
  loadingSpinner,
} as const;

export type LottieAnimation = keyof typeof LOTTIE_ANIMATIONS;

export interface LedgerLottieAttributes {
  animationData?: object;
  animationName: LottieAnimation;
  size?: LottieSize;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  paused?: boolean;
}

const lottieVariants = cva(["lottie-container", "lb-overflow-hidden"], {
  variants: {
    size: {
      small: ["lb-w-8", "lb-h-8"],
      medium: ["lb-w-16", "lb-h-16"],
      large: ["lb-w-32", "lb-h-32"],
      full: ["lb-w-full", "lb-h-full"],
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

@customElement("ledger-lottie")
@tailwindElement()
export class LedgerLottie extends LitElement {
  @property({ type: String })
  animationName?: LottieAnimation;

  @property({ type: Object })
  animationData?: object;

  @property({ type: String })
  size: LottieSize = "medium";

  @property({ type: Boolean })
  autoplay = true;

  @property({ type: Boolean })
  loop = false;

  @property({ type: Number })
  speed = 1;

  @property({ type: Boolean })
  paused = false;

  @query(".lottie-container")
  private container!: HTMLElement;

  private animation?: AnimationItem;

  private get containerClasses() {
    return {
      [lottieVariants({ size: this.size })]: true,
    };
  }

  override firstUpdated() {
    if (!this.animationName && !this.animationData) {
      throw new Error(
        "animationName or animationData is required for ledger-lottie",
      );
    }
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("animationData")) {
      this.initializeAnimation();
    }

    if (changedProperties.has("animationName")) {
      this.initializeAnimation();
    }

    if (changedProperties.has("paused")) {
      this.togglePlayPause();
    }

    if (changedProperties.has("speed") && this.animation) {
      this.animation.setSpeed(this.speed);
    }

    if (changedProperties.has("loop") && this.animation) {
      this.animation.loop = this.loop;
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.destroyAnimation();
  }

  private initializeAnimation() {
    if (!this.container || (!this.animationName && !this.animationData)) {
      return;
    }

    this.destroyAnimation();

    const data = this.animationName
      ? LOTTIE_ANIMATIONS[this.animationName]
      : this.animationData;

    this.animation = lottie.loadAnimation({
      container: this.container,
      renderer: "svg",
      loop: this.loop,
      autoplay: this.autoplay && !this.paused,
      animationData: data,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    });

    this.animation.setSpeed(this.speed);
  }

  private destroyAnimation() {
    if (!this.animation) {
      return;
    }

    this.animation.destroy();
    this.animation = undefined;
  }

  private togglePlayPause() {
    if (!this.animation) {
      return;
    }

    if (this.paused) {
      this.animation.pause();

      return;
    }

    this.animation.play();
  }

  public play() {
    this.paused = false;

    if (!this.animation) {
      return;
    }

    this.animation.play();
  }

  public pause() {
    this.paused = true;

    if (!this.animation) {
      return;
    }

    this.animation.pause();
  }

  public stop() {
    this.paused = true;

    if (this.animation) {
      this.animation.stop();
    }
  }

  public goToAndPlay(value: number, isFrame?: boolean) {
    if (!this.animation) {
      return;
    }

    this.animation.goToAndPlay(value, isFrame);
    this.paused = false;
  }

  public goToAndStop(value: number, isFrame?: boolean) {
    if (!this.animation) {
      return;
    }

    this.animation.goToAndStop(value, isFrame);
    this.paused = true;
  }

  public setSpeed(speed: number) {
    this.speed = speed;

    if (!this.animation) {
      return;
    }

    this.animation.setSpeed(speed);
  }

  public setDirection(direction: 1 | -1) {
    if (!this.animation) {
      return;
    }

    this.animation.setDirection(direction);
  }

  override render() {
    return html`
      <div
        class=${classMap(this.containerClasses)}
        role="img"
        aria-label="Lottie animation"
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-lottie": LedgerLottie;
  }
}

export default LedgerLottie;
