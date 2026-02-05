import "../../../components/index.js";

import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import { LedgerIconAttributes } from "../../../components/atom/icon/ledger-icon.js";
import { CoreContext, coreContext } from "../../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { Destinations } from "../../../shared/routes.js";
import { tailwindElement } from "../../../tailwind-element.js";

const MODAL_HEIGHT_COLLAPSED = "820px";
const MODAL_HEIGHT_EXPANDED = "1020px";

@customElement("welcome-screen")
@tailwindElement()
export class WelcomeScreen extends LitElement {
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

  @state()
  private isHowItWorksExpanded = false;

  override connectedCallback() {
    super.connectedCallback();
    this.updateModalHeight();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.documentElement.style.removeProperty("--modal-max-height");
  }

  private updateModalHeight() {
    const height = this.isHowItWorksExpanded
      ? MODAL_HEIGHT_EXPANDED
      : MODAL_HEIGHT_COLLAPSED;
    document.documentElement.style.setProperty("--modal-max-height", height);
  }

  private toggleHowItWorks() {
    this.isHowItWorksExpanded = !this.isHowItWorksExpanded;
    this.updateModalHeight();
  }

  private async handleContinue() {
    await this.coreContext.setWelcomeScreenCompleted();
  }

  private renderFeatureItem(
    iconType: LedgerIconAttributes["type"],
    title: string,
    description: string,
  ) {
    return html`
      <div class="lb-flex lb-items-start lb-gap-16">
        <div
          class="lb-flex lb-h-24 lb-w-24 lb-flex-shrink-0 lb-items-center lb-justify-center"
        >
          <ledger-icon type=${iconType} size="medium"></ledger-icon>
        </div>
        <div class="lb-flex lb-flex-col lb-gap-4">
          <span class="lb-text-base lb-body-1-semi-bold">${title}</span>
          <span class="lb-text-muted lb-body-2">${description}</span>
        </div>
      </div>
    `;
  }

  private renderHowItWorksCard(title: string, description: string) {
    return html`
      <div
        class="lb-flex lb-items-start lb-gap-12 lb-rounded-sm lb-p-16"
        style="background: rgba(255, 255, 255, 0.05);"
      >
        <div
          class="lb-mt-4 lb-h-8 lb-w-8 lb-flex-shrink-0 lb-rounded-full lb-bg-accent"
        ></div>
        <div class="lb-flex lb-flex-col lb-gap-4">
          <span class="lb-text-base lb-body-2-semi-bold">${title}</span>
          <span class="lb-text-muted lb-body-2">${description}</span>
        </div>
      </div>
    `;
  }

  override render() {
    const translations = this.languages.currentTranslation;
    const intro = translations.onboarding.consentPrompt?.intro;

    if (!intro) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <div class="lb-flex lb-flex-col lb-gap-24 lb-p-24 lb-pt-8">
        <div class="lb-flex lb-flex-col lb-gap-8 lb-text-center">
          <h2 class="lb-text-base lb-heading-4">${intro.title}</h2>
          <p class="lb-text-muted lb-body-2">${intro.subtitle}</p>
        </div>

        <div
          class="lb-flex lb-flex-col lb-gap-24 lb-rounded-lg lb-bg-muted lb-p-16"
        >
          ${this.renderFeatureItem(
            "directConnectivity",
            intro.features.directConnectivity.title,
            intro.features.directConnectivity.description,
          )}
          ${this.renderFeatureItem(
            "clearSigning",
            intro.features.clearSigning.title,
            intro.features.clearSigning.description,
          )}
          ${this.renderFeatureItem(
            "transactionCheck",
            intro.features.transactionCheck.title,
            intro.features.transactionCheck.description,
          )}
        </div>

        <div class="lb-overflow-hidden lb-rounded-lg lb-bg-muted">
          <button
            class="lb-flex lb-w-full lb-cursor-pointer lb-items-center lb-justify-between lb-border-0 lb-bg-transparent lb-p-16"
            @click=${this.toggleHowItWorks}
            aria-expanded=${this.isHowItWorksExpanded}
          >
            <div class="lb-flex lb-items-center lb-gap-12">
              <ledger-icon
                type="question"
                size="medium"
                fillColor="#9C9C9C"
              ></ledger-icon>
              <span class="lb-text-base lb-body-1-semi-bold"
                >${intro.howItWorks.title}</span
              >
            </div>
            <div
              class="lb-text-muted lb-transition-transform lb-duration-200"
              style="transform: rotate(${this.isHowItWorksExpanded
                ? "180deg"
                : "0deg"})"
            >
              <ledger-icon
                type="chevronDown"
                size="medium"
                fillColor="#9C9C9C"
              ></ledger-icon>
            </div>
          </button>

          ${this.isHowItWorksExpanded
            ? html`
                <div class="lb-flex lb-flex-col lb-gap-12 lb-px-16 lb-pb-16">
                  <p class="lb-text-muted lb-body-2">
                    ${unsafeHTML(intro.howItWorks.description)}
                  </p>
                  ${this.renderHowItWorksCard(
                    intro.howItWorks.alreadyActivated.title,
                    intro.howItWorks.alreadyActivated.description,
                  )}
                  ${this.renderHowItWorksCard(
                    intro.howItWorks.firstTime.title,
                    intro.howItWorks.firstTime.description,
                  )}
                </div>
              `
            : null}
        </div>

        <ledger-button
          variant="primary"
          size="full"
          .label=${intro.continueButton}
          @click=${this.handleContinue}
        ></ledger-button>

        <p class="lb-text-center lb-text-muted lb-body-2">
          ${intro.legalText}
          <a
            href="https://www.ledger.com/terms-of-use"
            target="_blank"
            rel="noopener noreferrer"
            class="lb-text-base lb-underline"
          >
            ${intro.termsAndConditions}
          </a>
          ${intro.and}
          <a
            href="https://www.ledger.com/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            class="lb-text-base lb-underline"
          >
            ${intro.privacyPolicy}
          </a>
        </p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "welcome-screen": WelcomeScreen;
  }
}
