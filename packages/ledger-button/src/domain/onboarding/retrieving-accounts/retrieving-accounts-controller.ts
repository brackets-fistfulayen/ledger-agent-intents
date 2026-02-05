import {
  NoAccountInSyncError,
  NoCompatibleAccountsError,
} from "@ledgerhq/ledger-wallet-provider-core";
import { type ReactiveController, type ReactiveControllerHost } from "lit";

import { type CoreContext } from "../../../context/core-context.js";
import { LanguageContext } from "../../../context/language-context.js";
import { Navigation } from "../../../shared/navigation.js";
import { RootNavigationComponent } from "../../../shared/root-navigation.js";
import { type Destinations } from "../../../shared/routes.js";

export class RetrievingAccountsController implements ReactiveController {
  errorData?: {
    message: string;
    title: string;
    cta1?: { label: string; action: () => void };
    cta2?: { label: string; action: () => void };
  } = undefined;

  private hasNavigated = false;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly core: CoreContext,
    private readonly navigation: Navigation,
    private readonly destinations: Destinations,
    private readonly lang: LanguageContext,
  ) {
    this.host.addController(this);
  }

  hostConnected() {
    this.fetchAccounts();
    this.host.requestUpdate();
  }

  // Note: We intentionally don't unsubscribe in hostDisconnected()
  // The Observable should continue running to fetch balances in background
  // and emit events for UI updates via the 'ledger-accounts-updated' event

  fetchAccounts() {
    try {
      const accounts$ = this.core.fetchAccountsWithProgress();

      // Subscribe to the Observable - let it complete naturally
      // The tap() in fetchAccountsWithProgress will emit events for UI updates
      accounts$.subscribe({
        next: (accounts) => {
          // Navigate on first emission (accounts available, balances still loading)
          if (!this.hasNavigated) {
            this.hasNavigated = true;
            this.host.requestUpdate();

            if (!accounts || accounts.length === 0) {
              this.navigation.navigateTo(this.destinations.turnOnSync);
              return;
            }

            // Navigate immediately - balances will load in background
            this.navigation.navigateTo(this.destinations.selectAccount);
          }
          // Subsequent emissions update the AccountService via tap in core
          // and dispatch 'ledger-accounts-updated' event for UI reactivity
        },
        error: (error) => {
          console.error(error);
          this.mapError(error);
        },
      });
    } catch (error) {
      console.error(error);
      this.mapError(error);
    }
  }

  mapError(error: unknown) {
    if (error instanceof NoCompatibleAccountsError) {
      const networksList = Array.isArray(error.context?.networks)
        ? error.context.networks
        : [];

      const networks =
        networksList.length > 1
          ? `${networksList.slice(0, -1).join(", ")} and ${networksList.slice(-1)[0]}`
          : networksList.length === 1
            ? networksList[0]!
            : "";

      this.errorData = {
        title:
          this.lang.currentTranslation.error.ledgerSync.NoCompatibleAccounts
            .title,
        message:
          this.lang.currentTranslation.error.ledgerSync.NoCompatibleAccounts.description.replace(
            "{networks}",
            networks,
          ),
        cta1: {
          label:
            this.lang.currentTranslation.error.ledgerSync.NoCompatibleAccounts
              .cta1,
          action: () => {
            // TODO: handle deeplink
            this.errorData = undefined;
            window.open("ledgerlive://accounts");
            if (this.navigation.host instanceof RootNavigationComponent) {
              this.navigation.host.closeModal();
            }
          },
        },
        cta2: {
          label:
            this.lang.currentTranslation.error.ledgerSync.NoCompatibleAccounts
              .cta2,
          action: () => {
            this.errorData = undefined;
            this.navigation.navigateTo(this.destinations.onboarding);
          },
        },
      };
    } else if (error instanceof NoAccountInSyncError) {
      this.errorData = {
        title:
          this.lang.currentTranslation.error.ledgerSync.NoAccountInSync.title,
        message:
          this.lang.currentTranslation.error.ledgerSync.NoAccountInSync
            .description,
        cta1: {
          label:
            this.lang.currentTranslation.error.ledgerSync.NoAccountInSync.cta1,
          action: () => {
            if (this.navigation.host instanceof RootNavigationComponent) {
              this.navigation.host.closeModal();
            }
          },
        },
      };
    } else {
      this.errorData = {
        title: this.lang.currentTranslation.error.generic.account.title,
        message:
          this.lang.currentTranslation.error.generic.account.description,
        cta1: {
          label: this.lang.currentTranslation.error.generic.account.cta1,
          action: () => {
            this.navigation.navigateTo(this.destinations.onboardingFlow);
          },
        },
      };
    }
  }
}
