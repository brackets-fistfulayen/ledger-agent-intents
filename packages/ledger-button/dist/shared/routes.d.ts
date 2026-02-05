import { LitElement } from 'lit';
import { Translation } from '../context/language-context.js';
export declare class LedgerButton404 extends LitElement {
    static styles: import('lit').CSSResult;
    render(): import('lit').TemplateResult<1>;
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
export declare const makeDestinations: (translation: Translation) => {
    readonly home: {
        readonly name: "home-flow";
        readonly component: "home-flow";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: "Your Ledger Wallet";
            readonly canClose: true;
            readonly showSettings: true;
        };
    };
    readonly deviceSwitch: {
        readonly name: "deviceSwitch";
        readonly component: "device-switch-screen";
        readonly canGoBack: true;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly deviceConnectionStatus: {
        readonly name: "deviceConnectionStatus";
        readonly component: "device-connection-status-screen";
        readonly canGoBack: true;
        readonly toolbar: {
            readonly title: "";
            readonly canClose: true;
        };
    };
    readonly onboardingFlow: {
        readonly name: "onboarding-flow";
        readonly component: "onboarding-flow";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly ledgerSync: {
        readonly name: "ledgerSync";
        readonly component: "ledger-sync-screen";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: false;
        };
    };
    readonly turnOnSync: {
        readonly name: "turnOnSync";
        readonly component: "turn-on-sync-screen";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly turnOnSyncDesktop: {
        readonly name: "turnOnSyncDesktop";
        readonly component: "turn-on-sync-desktop-screen";
        readonly canGoBack: true;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly turnOnSyncMobile: {
        readonly name: "turnOnSyncMobile";
        readonly component: "turn-on-sync-mobile-screen";
        readonly canGoBack: true;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly fetchAccounts: {
        readonly name: "fetchAccounts";
        readonly component: "retrieving-accounts-screen";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: false;
        };
    };
    readonly selectAccount: {
        readonly name: "selectAccount";
        readonly component: "select-account-screen";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly welcome: {
        readonly name: "welcome";
        readonly component: "welcome-screen";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: "";
            readonly canClose: true;
        };
    };
    readonly consentAnalytics: {
        readonly name: "consentAnalytics";
        readonly component: "consent-analytics-screen";
        readonly canGoBack: true;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly onboarding: {
        readonly name: "onboarding";
        readonly component: "select-device-screen";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly signTransaction: {
        readonly name: "signTransaction";
        readonly component: "sign-transaction-screen";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: "";
            readonly canClose: true;
        };
    };
    readonly signingFlow: {
        readonly name: "signingFlow";
        readonly component: "signing-flow";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: "";
            readonly canClose: true;
        };
    };
    readonly accountTokens: {
        readonly name: "accountTokens";
        readonly component: "account-tokens-screen";
        readonly canGoBack: true;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly settings: {
        readonly name: "settings";
        readonly component: "settings-screen";
        readonly canGoBack: true;
        readonly toolbar: {
            readonly title: string;
            readonly canClose: true;
        };
    };
    readonly notFound: {
        readonly name: "notFound";
        readonly component: "ledger-button-404";
        readonly canGoBack: false;
        readonly toolbar: {
            readonly title: "404";
            readonly canClose: true;
        };
    };
};
//# sourceMappingURL=routes.d.ts.map