import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import { tailwindElement } from "../../../tailwind-element.js";
import {
  ModalAnimationController,
  type ModalMode,
} from "./modal-animation-controller.js";
import { ModalFocusController } from "./modal-focus-controller.js";
import { ModalScrollLockController } from "./modal-scroll-lock-controller.js";

export type { ModalMode };

const styles = css`
  .modal-wrapper {
    display: none;
  }

  .modal-wrapper--open {
    display: block;
  }

  .modal-backdrop {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 7730;
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(102, 102, 102, 0.6) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
    backdrop-filter: blur(calc(var(--blur-md, 12px) / 2));
  }

  .modal-container {
    z-index: 7731;
    overflow: hidden;
  }

  .modal-container--center {
    width: min(calc(100% - 32px), 400px);
    height: auto;
    max-height: min(calc(100vh - 64px), var(--modal-max-height, 550px));
    opacity: 0;
    transition: max-height 0.3s ease;
  }

  .modal-container--panel {
    width: 400px;
    height: calc(100vh - 32px);
    max-height: 100vh;
    transform: translateX(100%);
  }
`;

const centerContainerClasses = {
  "modal-container": true,
  "modal-container--center": true,
  "lb-fixed": true,
  "lb-inset-0": true,
  "lb-flex": true,
  "lb-flex-col": true,
  "lb-self-center": true,
  "lb-justify-self-center": true,
  "lb-overflow-hidden": true,
  "lb-bg-canvas-sheet": true,
  "lb-rounded-2xl": true,
};

const panelContainerClasses = {
  "modal-container": true,
  "modal-container--panel": true,
  "lb-fixed": true,
  "lb-right-0": true,
  "lb-top-0": true,
  "lb-flex": true,
  "lb-flex-col": true,
  "lb-overflow-hidden": true,
  "lb-bg-canvas-sheet": true,
  "lb-rounded-2xl": true,
  "lb-m-16": true,
};

@customElement("ledger-modal")
@tailwindElement(styles)
export class LedgerModal extends LitElement {
  @property({ type: String })
  mode: ModalMode = "center";

  @state()
  private isClosing = false;

  @query(".modal-wrapper")
  private wrapperElement!: HTMLElement;

  @query(".modal-backdrop")
  private backdropElement!: HTMLElement;

  @query(".modal-container")
  private containerElement!: HTMLElement;

  private animationController = new ModalAnimationController(this);
  private focusController = new ModalFocusController(this);
  private scrollLockController = new ModalScrollLockController(this);

  public openModal(mode: ModalMode = "center"): void {
    this.mode = mode;
    this.dispatchEvent(
      new CustomEvent("modal-opened", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  public closeModal(): void {
    if (this.isClosing) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("modal-closed", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("modal-opened", this.handleOpen);
    this.addEventListener("modal-closed", this.handleClose);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("modal-opened", this.handleOpen);
    this.removeEventListener("modal-closed", this.handleClose);
  }

  private handleOpen = async (): Promise<void> => {
    this.scrollLockController.lock();

    await this.updateComplete;

    this.animationController.animateOpen(
      {
        backdrop: this.backdropElement,
        container: this.containerElement,
        wrapper: this.wrapperElement,
      },
      this.mode,
    );

    this.focusController.activate(this.containerElement, () =>
      this.closeModal(),
    );
  };

  private handleClose = async (): Promise<void> => {
    this.isClosing = true;
    this.focusController.deactivate();

    await this.animationController.animateClose(
      {
        backdrop: this.backdropElement,
        container: this.containerElement,
        wrapper: this.wrapperElement,
      },
      this.mode,
    );

    this.scrollLockController.unlock();
    this.isClosing = false;
    this.dispatchAnimationComplete();
  };

  private dispatchAnimationComplete(): void {
    this.dispatchEvent(
      new CustomEvent("modal-animation-complete", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderBackdrop() {
    return html`
      <div
        class="modal-backdrop"
        data-testid="modal-backdrop"
        @click=${this.closeModal}
      ></div>
    `;
  }

  private renderToolbar() {
    return html`
      <slot name="toolbar">
        <ledger-toolbar
          title="Ledger Button"
          aria-label="Ledger Button"
          @ledger-toolbar-close=${this.closeModal}
        ></ledger-toolbar>
      </slot>
    `;
  }

  private renderContent() {
    return html`
      <div
        id="modal-content"
        class="lb-relative lb-flex-1 lb-overflow-y-auto lb-text-base"
      >
        <slot>hello</slot>
      </div>
    `;
  }

  private renderCenterContainer() {
    return html`
      <div
        class=${classMap(centerContainerClasses)}
        role="dialog"
        aria-modal="true"
        aria-describedby="modal-content"
        @click=${(e: Event) => e.stopPropagation()}
      >
        ${this.renderToolbar()} ${this.renderContent()}
      </div>
    `;
  }

  private renderPanelContainer() {
    return html`
      <div
        class=${classMap(panelContainerClasses)}
        role="dialog"
        aria-modal="true"
        aria-describedby="modal-content"
        @click=${(e: Event) => e.stopPropagation()}
      >
        ${this.renderToolbar()} ${this.renderContent()}
      </div>
    `;
  }

  override render() {
    return html`
      <div class="modal-wrapper">
        ${this.renderBackdrop()}
        ${this.mode === "panel"
          ? this.renderPanelContainer()
          : this.renderCenterContainer()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-modal": LedgerModal;
  }

  interface WindowEventMap {
    "modal-opened": CustomEvent<void>;
    "modal-closed": CustomEvent<void>;
    "modal-animation-complete": CustomEvent<void>;
  }
}
