import "../domain/onboarding/select-device/select-device.js";
import "../domain/onboarding/ledger-sync/ledger-sync.js";
import "../domain/onboarding/retrieving-accounts/retrieving-accounts.js";
import "../domain/onboarding/select-account/select-account.js";
import "../domain/onboarding/welcome/welcome-screen.js";
import "../domain/onboarding/consent-prompt/consent-analytics-screen.js";
import "../domain/sign-transaction/sign-transaction.js";
import "../domain/home/ledger-home.js";
import "../domain/device-switch/device-switch.js";
import "../domain/device-connection-status/device-connection-status.js";
import "../domain/onboarding/turn-on-sync/turn-on-sync.js";
import "../domain/onboarding/onboarding-flow/onboarding-flow.js";
import "../domain/signing-flow/signing-flow.js";
import "../domain/account-tokens/account-tokens.js";
import "../domain/onboarding/turn-on-sync-desktop/turn-on-sync-desktop.js";
import "../domain/onboarding/turn-on-sync-mobile/turn-on-sync-mobile.js";
import "../domain/settings/settings-screen.js";
import "../domain/home-flow/home-flow.js";

import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { Translation } from "../context/language-context.js";

@customElement("ledger-button-404")
export class LedgerButton404 extends LitElement {
  static override styles = css`
    :host(.remove) {
      animation: outro 250ms ease-in-out;
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

    @keyframes outro {
      from {
        opacity: 1;
        transform: scale(1) translateY(0);
      }

      to {
        opacity: 0;
        transform: scale(0.95) translateY(32px);
      }
    }
  `;

  override render() {
    return html`<h1>404</h1>`;
  }
}

export type Destinations = Record<string, Destination>;
export type Destination = {
  name: string;
  component: string;
  canGoBack: boolean;
  toolbar: {
    title: string;
    canClose: boolean;
  };
};

// MOVE DESTINATIONS TO NAVIGATION
export const makeDestinations = (translation: Translation) => {
  const destinations = {
    home: {
      name: "home-flow",
      component: "home-flow",
      canGoBack: false,
      toolbar: {
        title: "Your Ledger Wallet",
        canClose: true,
        showSettings: true,
      },
    },
    deviceSwitch: {
      name: "deviceSwitch",
      component: "device-switch-screen",
      canGoBack: true,
      toolbar: {
        title: translation.deviceSwitch.title,
        canClose: true,
      },
    },
    deviceConnectionStatus: {
      name: "deviceConnectionStatus",
      component: "device-connection-status-screen",
      canGoBack: true,
      toolbar: {
        title: "",
        canClose: true,
      },
    },
    onboardingFlow: {
      name: "onboarding-flow",
      component: "onboarding-flow",
      canGoBack: false,
      toolbar: {
        title: translation.onboarding.selectDevice.title,
        canClose: true,
      },
    },
    ledgerSync: {
      name: "ledgerSync",
      component: "ledger-sync-screen",
      canGoBack: false,
      toolbar: {
        title: translation.onboarding.ledgerSync.title,
        canClose: false,
      },
    },
    turnOnSync: {
      name: "turnOnSync",
      component: "turn-on-sync-screen",
      canGoBack: false,
      toolbar: {
        title: translation.onboarding.turnOnSync.title,
        canClose: true,
      },
    },
    turnOnSyncDesktop: {
      name: "turnOnSyncDesktop",
      component: "turn-on-sync-desktop-screen",
      canGoBack: true,
      toolbar: {
        title: translation.ledgerSync.activate,
        canClose: true,
      },
    },
    turnOnSyncMobile: {
      name: "turnOnSyncMobile",
      component: "turn-on-sync-mobile-screen",
      canGoBack: true,
      toolbar: {
        title: translation.ledgerSync.activate,
        canClose: true,
      },
    },
    fetchAccounts: {
      name: "fetchAccounts",
      component: "retrieving-accounts-screen",
      canGoBack: false,
      toolbar: {
        title: translation.onboarding.retrievingAccounts.title,
        canClose: false,
      },
    },
    selectAccount: {
      name: "selectAccount",
      component: "select-account-screen",
      canGoBack: false,
      toolbar: {
        title: translation.onboarding.selectAccount.title,
        canClose: true,
      },
    },
    welcome: {
      name: "welcome",
      component: "welcome-screen",
      canGoBack: false,
      toolbar: {
        title: "",
        canClose: true,
      },
    },
    consentAnalytics: {
      name: "consentAnalytics",
      component: "consent-analytics-screen",
      canGoBack: true,
      toolbar: {
        title: translation.onboarding.consentPrompt?.consent?.title,
        canClose: true,
      },
    },
    onboarding: {
      name: "onboarding",
      component: "select-device-screen",
      canGoBack: false,
      toolbar: {
        title: translation.onboarding.selectDevice.title,
        canClose: true,
      },
    },
    signTransaction: {
      name: "signTransaction",
      component: "sign-transaction-screen",
      canGoBack: false,
      toolbar: {
        title: "",
        canClose: true,
      },
    },
    signingFlow: {
      name: "signingFlow",
      component: "signing-flow",
      canGoBack: false,
      toolbar: {
        title: "",
        canClose: true,
      },
    },
    accountTokens: {
      name: "accountTokens",
      component: "account-tokens-screen",
      canGoBack: true,
      toolbar: {
        title: translation.accountTokens?.title,
        canClose: true,
      },
    },
    settings: {
      name: "settings",
      component: "settings-screen",
      canGoBack: true,
      toolbar: {
        title: translation.settings?.title,
        canClose: true,
      },
    },
    notFound: {
      name: "notFound",
      component: "ledger-button-404",
      canGoBack: false,
      toolbar: {
        title: "404",
        canClose: true,
      },
    },
  } as const;

  return destinations;
};
