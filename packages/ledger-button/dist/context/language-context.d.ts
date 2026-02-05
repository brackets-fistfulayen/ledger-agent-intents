import { LitElement } from 'lit';
export declare const languages: {
    readonly en: {
        common: {
            connect: string;
            button: {
                connect: string;
                usb: string;
                bluetooth: string;
                usb_hint: string;
                bluetooth_hint: string;
                close: string;
                tryAgain: string;
                disconnect: string;
            };
            ad: {
                getALedger: string;
            };
            platform: {
                onDesktop: string;
                onMobile: string;
            };
            learnMore: string;
            device: {
                model: {
                    nanoS: string;
                    nanoSP: string;
                    nanoX: string;
                    stax: string;
                    flex: string;
                    apexp: string;
                    fallback: string;
                };
                deviceActions: {
                    continueOnLedger: {
                        title: string;
                        description: string;
                    };
                    pin: {
                        title: string;
                        description: string;
                    };
                    signTransaction: {
                        title: string;
                        description: string;
                    };
                };
            };
        };
        home: {
            balance: string;
        };
        walletActions: {
            send: string;
            receive: string;
            swap: string;
            buy: string;
            earn: string;
            sell: string;
        };
        walletRedirect: {
            title: string;
            description: string;
            confirm: string;
            download: string;
        };
        deviceSwitch: {
            title: string;
            noDevices: string;
            connectAnother: string;
            connectBluetooth: string;
            connectUsb: string;
            status: {
                connected: string;
                available: string;
            };
        };
        ledgerSync: {
            turnOnLedgerSyncTitle: string;
            turnOnLedgerSyncSubtitle: string;
            activateSelectPlatform: string;
            activate: string;
            activateStep1Desktop: string;
            activateStep1DesktopLLInstalled: string;
            activateStep1Mobile: string;
            activateStep2: string;
            activated: string;
        };
        onboarding: {
            selectDevice: {
                title: string;
            };
            ledgerSync: {
                title: string;
            };
            retrievingAccounts: {
                title: string;
            };
            selectAccount: {
                title: string;
                showTokens: string;
            };
            turnOnSync: {
                title: string;
                subtitle: string;
                text: string;
            };
            consentPrompt: {
                intro: {
                    title: string;
                    subtitle: string;
                    features: {
                        directConnectivity: {
                            title: string;
                            description: string;
                        };
                        clearSigning: {
                            title: string;
                            description: string;
                        };
                        transactionCheck: {
                            title: string;
                            description: string;
                        };
                    };
                    howItWorks: {
                        title: string;
                        description: string;
                        alreadyActivated: {
                            title: string;
                            description: string;
                        };
                        firstTime: {
                            title: string;
                            description: string;
                        };
                    };
                    continueButton: string;
                    legalText: string;
                    termsAndConditions: string;
                    and: string;
                    privacyPolicy: string;
                };
                consent: {
                    title: string;
                    description: string;
                    privacyNotice: string;
                    privacyPolicyLink: string;
                    acceptButton: string;
                    rejectButton: string;
                };
            };
        };
        accountTokens: {
            title: string;
            noTokens: string;
        };
        settings: {
            title: string;
            analytics: {
                title: string;
                description: string;
            };
        };
        signTransaction: {
            success: {
                title: string;
                description: string;
                viewTransaction: string;
            };
            error: {
                title: string;
                description: string;
            };
        };
        signMessage: {
            success: {
                title: string;
                description: string;
            };
            error: {
                title: string;
                description: string;
            };
        };
        error: {
            generic: {
                account: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
                sign: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
            };
            device: {
                DeviceNotSupported: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
                IncorrectSeed: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
                BlindSigningDisabled: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
                UserRejectedTransaction: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
                UserRejectedMessage: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
            };
            ledgerSync: {
                ConnectionFailed: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
                NoCompatibleAccounts: {
                    title: string;
                    description: string;
                    cta1: string;
                    cta2: string;
                };
                NoAccountInSync: {
                    title: string;
                    description: string;
                    cta1: string;
                };
            };
            network: {
                BroadcastTransactionError: {
                    title: string;
                    description: string;
                    cta1: string;
                };
            };
            connection: {
                DeviceDisconnected: {
                    title: string;
                    description: string;
                    cta1: string;
                };
            };
        };
    };
};
export type Languages = typeof languages;
export type LangKey = keyof Languages;
export type Translation = Languages[keyof Languages];
export declare class LanguageContext {
    private readonly _languages;
    private _currentLanguage;
    constructor(_languages?: Languages);
    setCurrentLanguage(lang: keyof Languages): void;
    get currentLanguage(): LangKey;
    get currentTranslation(): Translation;
}
export declare const langContext: {
    __context__: LanguageContext;
};
export declare class LanguageProvider extends LitElement {
    languages: LanguageContext;
    render(): import('lit').TemplateResult<1>;
}
//# sourceMappingURL=language-context.d.ts.map