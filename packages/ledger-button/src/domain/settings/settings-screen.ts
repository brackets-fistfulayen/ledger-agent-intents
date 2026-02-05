import "../../components/index.js";
import "../../components/atom/toggle/ledger-toggle.js";

import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CoreContext, coreContext } from "../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../context/language-context.js";
import { Navigation } from "../../shared/navigation.js";
import { Destinations } from "../../shared/routes.js";
import { tailwindElement } from "../../tailwind-element.js";

@customElement("settings-screen")
@tailwindElement()
export class SettingsScreen extends LitElement {
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
  private analyticsEnabled = false;

  override async connectedCallback() {
    super.connectedCallback();
    this.analyticsEnabled = await this.coreContext.hasConsent();
  }

  private async handleToggleChange(e: CustomEvent) {
    const { checked } = e.detail;

    if (checked) {
      await this.coreContext.giveConsent();
    } else {
      await this.coreContext.removeConsent();
    }

    this.analyticsEnabled = checked;
  }

  override render() {
    const translations = this.languages.currentTranslation;
    const settings = translations.settings;

    if (!settings) {
      return html`<div>Loading...</div>`;
    }

    return html`
      <div class="lb-flex lb-flex-col lb-p-24 lb-pt-8">
        <div class="lb-rounded-md lb-bg-muted lb-p-16">
          <div class="lb-flex lb-flex-row lb-items-center lb-justify-between">
            <h3 class="lb-text-base lb-body-3-semi-bold">
              ${settings.analytics.title}
            </h3>
            <ledger-toggle
              .checked=${this.analyticsEnabled}
              @ledger-toggle-change=${this.handleToggleChange}
            ></ledger-toggle>
          </div>

          <p class="lb-leading-relaxed lb-mt-16 lb-text-muted lb-body-3">
            ${settings.analytics.description}
          </p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-screen": SettingsScreen;
  }
}
