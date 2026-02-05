import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CoreContext, coreContext } from "../../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { Destinations } from "../../../shared/routes.js";
import { tailwindElement } from "../../../tailwind-element.js";
import { TurnOnSyncDesktopController } from "./turn-on-sync-desktop-controller.js";

@customElement("turn-on-sync-desktop-screen")
@tailwindElement()
export class TurnOnSyncDesktopScreen extends LitElement {
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

  controller!: TurnOnSyncDesktopController;

  override connectedCallback() {
    super.connectedCallback();
    this.controller = new TurnOnSyncDesktopController(
      this,
      this.navigation,
      this.destinations,
    );
  }

  private handleLedgerSyncActivated() {
    this.controller.handleLedgerSyncActivated();
  }

  private handleTurnOnLedgerSync() {
    this.controller.handleTurnOnLedgerSync();
  }

  override render() {
    const lang = this.languageContext.currentTranslation;
    return html`
      <div class="lb-flex lb-flex-col lb-gap-40 lb-p-24 lb-pt-0">
        <div class="lb-flex lb-flex-col lb-gap-24">
          <div class="lb-flex lb-flex-col lb-gap-4">
            <div class="lb-flex lb-flex-row lb-gap-4">
              <p class="lb-text-base lb-body-2">1.</p>
              <p class="lb-text-base lb-body-2">
                ${lang.ledgerSync.activateStep1Desktop}
              </p>
            </div>
            <p class="lb-text-center lb-text-muted lb-body-3">
              ${lang.ledgerSync.activateStep1DesktopLLInstalled}
            </p>
          </div>
          <div class="lb-flex lb-flex-row lb-items-center lb-justify-center">
            <ledger-button
              variant="primary"
              .icon=${true}
              iconType="desktop"
              size="small"
              .label=${lang.ledgerSync.activate}
              @click=${this.handleTurnOnLedgerSync}
            ></ledger-button>
          </div>
        </div>
        <div class="lb-flex lb-flex-col lb-gap-24">
          <div class="lb-flex lb-flex-row lb-gap-4">
            <p class="lb-text-base lb-body-2">2.</p>
            <p class="lb-text-base lb-body-2">
              ${lang.ledgerSync.activateStep2}
            </p>
          </div>
          <ledger-button
            variant="primary"
            size="full"
            .label=${lang.ledgerSync.activated}
            @click=${this.handleLedgerSyncActivated}
          ></ledger-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "turn-on-sync-desktop-screen": TurnOnSyncDesktopScreen;
  }
}
