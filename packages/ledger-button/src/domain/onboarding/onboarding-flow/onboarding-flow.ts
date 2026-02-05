import "../welcome/welcome-screen.js";
import "../consent-prompt/consent-analytics-screen.js";
import "../select-device/select-device.js";
import "../ledger-sync/ledger-sync.js";
import "../retrieving-accounts/retrieving-accounts.js";
import "../select-account/select-account.js";

import { consume } from "@lit/context";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { html as staticHtml, unsafeStatic } from "lit/static-html.js";

import { CoreContext, coreContext } from "../../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { Destinations } from "../../../shared/routes.js";
import { OnboardingFlowController } from "./onboarding-flow-controller.js";

@customElement("onboarding-flow")
export class OnboardingFlow extends LitElement {
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

  controller!: OnboardingFlowController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new OnboardingFlowController(this, this.coreContext);
  }

  override render() {
    const stateTag = unsafeStatic(this.controller.state + "-screen");

    return staticHtml`
        <${stateTag}
        .destinations=${this.destinations}
        .navigation=${this.navigation}
        ></${stateTag}>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "onboarding-flow": OnboardingFlow;
  }
}
