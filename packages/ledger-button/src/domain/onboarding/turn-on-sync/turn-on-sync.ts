import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { PlatformItemClickEventDetail } from "../../../components/molecule/platform-item/ledger-platform-item.js";
import { CoreContext, coreContext } from "../../../context/core-context.js";
import {
  langContext,
  LanguageContext,
} from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { Destinations } from "../../../shared/routes.js";
import { tailwindElement } from "../../../tailwind-element.js";
import banner from "./banner.png";
import { TurnOnSyncController } from "./turn-on-sync-controller.js";

@customElement("turn-on-sync-screen")
@tailwindElement()
export class TurnOnSyncScreen extends LitElement {
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

  controller!: TurnOnSyncController;

  override connectedCallback() {
    super.connectedCallback();

    this.controller = new TurnOnSyncController(
      this,
      this.navigation,
      this.destinations,
    );
  }

  private handleActivateMobile(
    _event: CustomEvent<PlatformItemClickEventDetail>,
  ) {
    this.controller.handleTurnOnSyncOnMobile();
  }

  private handleActivateDesktop(
    _event: CustomEvent<PlatformItemClickEventDetail>,
  ) {
    this.controller.handleTurnOnSyncOnDesktop();
  }

  private handleLearnMore() {
    this.controller.handleLearnMore();
  }

  override render() {
    const lang = this.languageContext.currentTranslation;
    return html`
      <div class="lb-flex lb-flex-col lb-gap-32 lb-p-24 lb-pt-0">
        <div class="lb-flex lb-flex-row lb-items-center lb-justify-center">
          <img class="lb-w-full lb-max-w-176" src=${banner} alt="banner" />
        </div>
        <div class="lb-flex lb-flex-col lb-gap-8">
          <h4 class="lb-text-center lb-text-base lb-heading-4">
            ${lang.ledgerSync.turnOnLedgerSyncTitle}
          </h4>
          <p class="lb-text-center lb-text-muted lb-body-2">
            ${lang.ledgerSync.turnOnLedgerSyncSubtitle}
          </p>
        </div>
        <div class="lb-flex lb-flex-col lb-gap-16">
          <div class="lb-flex lb-flex-col lb-gap-8">
            <h6 class="lb-body-2 lb-text-center lb-text-base">
              ${lang.ledgerSync.activateSelectPlatform}
            </h6>
          </div>
          <ledger-platform-item
            title=${lang.common.platform.onMobile}
            platform-type="mobile"
            @ledger-platform-item-click=${this.handleActivateMobile}
          ></ledger-platform-item>
          <ledger-platform-item
            title=${lang.common.platform.onDesktop}
            platform-type="desktop"
            @ledger-platform-item-click=${this.handleActivateDesktop}
          ></ledger-platform-item>
        </div>
        <div class="lb-flex lb-flex-col lb-gap-16">
          <button
            class="lb-text-muted lb-body-1-semi-bold lb-flex lb-items-center lb-justify-center lb-gap-8"
            @click=${this.handleLearnMore}
          >
            <p
              class="lb-text-muted lb-body-1-semi-bold lb-underline lb-underline-offset-4"
            >
              ${lang.common.learnMore}
            </p>
            <ledger-icon
              type="externalLink"
              fillColor="currentColor"
              size="medium"
            ></ledger-icon>
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "turn-on-sync-screen": TurnOnSyncScreen;
  }
}
