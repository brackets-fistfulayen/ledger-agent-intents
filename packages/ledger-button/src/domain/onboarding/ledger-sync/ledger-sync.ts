import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { AnimationKey, type StatusType } from "../../../components/index.js";
import {
  type CoreContext,
  coreContext,
} from "../../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { Destinations } from "../../../shared/routes.js";
import { tailwindElement } from "../../../tailwind-element.js";
import { LedgerSyncController } from "./ledger-sync-controller.js";

const styles = css`
  :host {
    display: block;
    height: 100%;
  }
`;

@customElement("ledger-sync-screen")
@tailwindElement(styles)
export class LedgerSyncScreen extends LitElement {
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

  controller!: LedgerSyncController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new LedgerSyncController(
      this,
      this.coreContext,
      this.navigation,
      this.destinations,
      this.languages,
    );
  }

  handleStatusAction = (
    e: CustomEvent<{
      timestamp: number;
      action: "primary" | "secondary";
      type: StatusType;
    }>,
  ) => {
    const actionMapper = {
      primary: () => {
        this.controller.errorData?.cta1?.action();
      },
      secondary: () => {
        this.controller.errorData?.cta2?.action();
      },
    };

    actionMapper[e.detail.action]?.();
  };

  renderNormalScreen() {
    const { animation } = this.controller;
    const lang = this.languages.currentTranslation;
    const deviceModel = this.coreContext.getConnectedDevice()?.modelId;

    const deviceTitle = lang.common.device.deviceActions[
      animation as keyof typeof lang.common.device.deviceActions
    ].title.replace(
      "{device}",
      lang.common.device.model[
        deviceModel as keyof typeof lang.common.device.model
      ],
    );

    const deviceDescription =
      lang.common.device.deviceActions[
        animation as keyof typeof lang.common.device.deviceActions
      ].description;

    return html`
      <div
        class="lb-min-h-200 lb-flex lb-flex-col lb-items-center lb-justify-center lb-gap-24 lb-self-stretch lb-px-24 lb-pb-48"
      >
        <div class="lb-flex lb-w-208 lb-items-center lb-justify-center">
          <ledger-device-animation
            modelId=${deviceModel ?? "flex"}
            animation=${animation as AnimationKey}
          ></ledger-device-animation>
        </div>
        <div
          class="lb-flex lb-flex-col lb-items-center lb-gap-8 lb-self-stretch"
        >
          <p class="lb-text-center lb-heading-4-semi-bold">${deviceTitle}</p>
          <p class="lb-text-center lb-text-muted lb-body-2">
            ${deviceDescription}
          </p>
        </div>
      </div>
    `;
  }

  renderErrorScreen() {
    if (!this.controller.errorData) {
      return html``;
    }

    return html`
      <div class="lb-flex lb-flex-col lb-gap-12 lb-p-24 lb-pt-0">
        <ledger-status
          type="error"
          title=${this.controller.errorData?.title}
          description=${this.controller.errorData?.message}
          primary-button-label=${this.controller.errorData?.cta1?.label ?? ""}
          secondary-button-label=${this.controller.errorData?.cta2?.label ?? ""}
          @status-action=${this.handleStatusAction}
        ></ledger-status>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="lb-flex lb-h-full lb-flex-col lb-items-center lb-justify-center">
        ${this.controller.errorData
          ? this.renderErrorScreen()
          : this.renderNormalScreen()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ledger-sync-screen": LedgerSyncScreen;
  }
}
