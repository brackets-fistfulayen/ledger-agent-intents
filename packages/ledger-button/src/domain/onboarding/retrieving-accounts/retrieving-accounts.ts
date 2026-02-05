import "../../../components/index.js";

import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { StatusType } from "../../../components/organism/status/ledger-status.js";
import { CoreContext, coreContext } from "../../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { Destinations } from "../../../shared/routes.js";
import { tailwindElement } from "../../../tailwind-element.js";
import { RetrievingAccountsController } from "./retrieving-accounts-controller.js";

const styles = css`
  :host {
    display: block;
    height: 100%;
  }

  .animation {
    position: relative;
  }

  .animation::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      0deg,
      rgba(21, 21, 21, 0) 0%,
      var(--background-canvas-sheet) 100%
    );
  }
`;
@customElement("retrieving-accounts-screen")
@tailwindElement(styles)
export class RetrievingAccountsScreen extends LitElement {
  @property({ type: Object })
  navigation!: Navigation;

  @property({ type: Object })
  destinations!: Destinations;

  @consume({ context: coreContext })
  @property({ attribute: false })
  public coreContext!: CoreContext;

  @consume({ context: langContext })
  @property({ attribute: false })
  public languages!: LanguageContext;

  controller!: RetrievingAccountsController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new RetrievingAccountsController(
      this,
      this.coreContext,
      this.navigation,
      this.destinations,
      this.languages,
    );
  }

  private async handleStatusActionError(
    e: CustomEvent<{
      timestamp: number;
      action: "primary" | "secondary";
      type: StatusType;
    }>,
  ) {
    if (e.detail.action === "primary") {
      await this.controller.errorData?.cta1?.action();
    } else if (e.detail.action === "secondary") {
      await this.controller.errorData?.cta2?.action();
    }
  }

  renderErrorScreen() {
    if (!this.controller.errorData) {
      return html``;
    }

    return html`
      <div class="lb-flex lb-flex-col lb-gap-12 lb-p-24 lb-pt-0">
        <ledger-status
          type="error"
          title=${this.controller.errorData.title}
          description=${this.controller.errorData.message}
          primary-button-label=${this.controller.errorData.cta1?.label ?? ""}
          secondary-button-label=${this.controller.errorData.cta2?.label ?? ""}
          @status-action=${this.handleStatusActionError}
        ></ledger-status>
      </div>
    `;
  }

  renderScreen() {
    return html`
      <div class="lb-h-full lb-min-h-full lb-overflow-hidden">
        <ledger-lottie
          class="animation lb-h-full lb-overflow-hidden"
          animationName="backgroundFlare"
          .autoplay=${true}
          .loop=${true}
          size="full"
        ></ledger-lottie>
      </div>
    `;
  }

  override render() {
    return this.controller.errorData
      ? this.renderErrorScreen()
      : this.renderScreen();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "retrieving-accounts-screen": RetrievingAccountsScreen;
  }
}
