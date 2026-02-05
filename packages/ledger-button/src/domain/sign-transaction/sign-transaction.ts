import "../../components/index.js";
import "../onboarding/ledger-sync/ledger-sync";

import {
  type SignedResults,
  type SignPersonalMessageParams,
  type SignRawTransactionParams,
  type SignTransactionParams,
  type SignTypedMessageParams,
} from "@ledgerhq/ledger-wallet-provider-core";
import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { AnimationKey } from "../../components/index.js";
import { type StatusType } from "../../components/organism/status/ledger-status.js";
import { CoreContext, coreContext } from "../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../context/language-context.js";
import { Navigation } from "../../shared/navigation.js";
import { Destinations } from "../../shared/routes.js";
import { tailwindElement } from "../../tailwind-element.js";
import { SignTransactionController } from "./sign-transaction-controller.js";

const styles = css`
  :host {
    display: block;
    height: 100%;
    animation: intro 250ms ease-in-out;
    transform-origin: left bottom;
  }

  :host(.remove) {
    animation: intro 250ms ease-in-out reverse;
  }

  @keyframes intro {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(32px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

type Params = SignTransactionParams & {
  broadcast: boolean;
};

@customElement("sign-transaction-screen")
@tailwindElement(styles)
export class SignTransactionScreen extends LitElement {
  @property({ type: Object })
  navigation!: Navigation;

  @property({ type: Object })
  destinations!: Destinations;

  @consume({ context: coreContext })
  @property({ attribute: false })
  public coreContext!: CoreContext;

  @consume({ context: langContext })
  @property({ attribute: false })
  public languageContext!: LanguageContext;

  @property({ type: Object })
  transactionParams?:
    | SignTransactionParams
    | SignPersonalMessageParams
    | SignRawTransactionParams
    | SignTypedMessageParams;

  @property({ type: Object })
  params?: unknown;

  @property({ type: Boolean, attribute: false })
  broadcast = false;

  controller!: SignTransactionController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new SignTransactionController(
      this,
      this.coreContext,
      this.navigation,
      this.languageContext,
    );

    if (this.isParams(this.params)) {
      this.broadcast = this.params.broadcast;
    }

    const transactionParams =
      (this.params as Params) ??
      this.transactionParams ??
      this.coreContext.getPendingTransactionParams();

    if (!transactionParams) {
      this.controller.state.screen = "error";
      this.requestUpdate();
      return;
    }

    this.transactionParams = transactionParams;
    this.controller.startSigning(transactionParams);
  }

  private isParams(params: unknown): params is Params {
    return (
      typeof params === "object" &&
      params !== null &&
      "transaction" in params &&
      "broadcast" in params
    );
  }

  private renderSigningState() {
    if (this.controller.state.screen !== "signing") {
      return html``;
    }

    const lang = this.languageContext.currentTranslation;
    const deviceModel = this.coreContext.getConnectedDevice()?.modelId;
    const deviceAnimation = this.controller.state.deviceAnimation;

    if (!deviceModel) return;

    const deviceTitle = lang.common.device.deviceActions[
      deviceAnimation as keyof typeof lang.common.device.deviceActions
    ].title.replace(
      "{device}",
      lang.common.device.model[
        deviceModel as keyof typeof lang.common.device.model
      ],
    );

    const deviceDescription =
      lang.common.device.deviceActions[
        deviceAnimation as keyof typeof lang.common.device.deviceActions
      ].description;

    return html`
      <div
        class="lb-min-h-200 lb-flex lb-flex-col lb-items-center lb-justify-center lb-gap-24 lb-self-stretch lb-px-24 lb-pb-48"
      >
        <div class="lb-flex lb-w-208 lb-items-center lb-justify-center">
          <ledger-device-animation
            modelId=${deviceModel}
            animation=${deviceAnimation as AnimationKey}
          ></ledger-device-animation>
        </div>
        <div
          class="lb-flex lb-flex-col lb-items-center lb-gap-8 lb-self-stretch"
        >
          <p class="lb-text-center lb-body-1">${deviceTitle}</p>
          <p class="lb-text-center lb-text-muted lb-body-2">
            ${deviceDescription}
          </p>
        </div>
      </div>
    `;
  }

  private renderStatusState() {
    if (this.controller.state.screen === "signing") {
      return html``;
    }

    return html`
      <div
        class="lb-flex lb-min-h-0 lb-flex-col lb-items-stretch lb-justify-center lb-self-stretch lb-p-24 lb-pt-0"
      >
        <ledger-status
          type=${this.controller.state.screen}
          title=${this.controller.state.status.title}
          description=${this.controller.state.status.message}
          primary-button-label=${this.controller.state.status.cta1.label}
          secondary-button-label=${this.controller.state.status.cta2?.label ??
          ""}
          @status-action=${this.handleStatusAction}
        ></ledger-status>
      </div>
    `;
  }

  private handleStatusAction(
    event: CustomEvent<{
      timestamp: number;
      action: "primary" | "secondary";
      type: StatusType;
    }>,
  ) {
    if (this.controller.state.screen === "signing") {
      return;
    }

    const { action } = event.detail;

    if (action === "primary") {
      this.controller.state.status.cta1.action();
    } else if (action === "secondary") {
      this.controller.state.status.cta2?.action();
    }
  }

  override render() {
    return html`
      <div class="lb-flex lb-h-full lb-flex-col lb-items-center lb-justify-center">
        ${this.controller.state.screen === "success" ||
        this.controller.state.screen === "error"
          ? this.renderStatusState()
          : this.renderSigningState()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sign-transaction-screen": SignTransactionScreen;
  }

  interface WindowEventMap {
    "ledger-internal-sign": CustomEvent<
      | { status: "success"; data: SignedResults }
      | { status: "error"; error: unknown }
    >;
  }
}
