import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { tailwindElement } from "../../../tailwind-element.js";

@customElement("ledger-modal-story-wrapper")
@tailwindElement()
export class LedgerModalStoryWrapper extends LitElement {
  @property({ type: String })
  override title = "";

  @property({ type: Boolean })
  showClose = true;

  @property({ type: Boolean })
  showLogo = true;

  override render() {
    return html`
      <div
        class="lb-z-10 lb-fixed lb-inset-0 lb-flex lb-flex-col lb-self-center lb-justify-self-center lb-overflow-y-auto lb-rounded-xl lb-bg-black"
        @click=${(e: Event) => e.stopPropagation()}
        style="width: min(calc(100% - 32px), 400px); max-height: 550px"
      >
        <slot name="toolbar">
          <!-- Default test toolbar -->
          <ledger-toolbar
            title=${this.title}
            aria-label=${this.title}
          ></ledger-toolbar>
        </slot>
        <div class="lb-text-base">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
