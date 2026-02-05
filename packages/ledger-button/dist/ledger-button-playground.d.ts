import { LitElement } from 'lit';
export declare class LedgerButtonPlayground extends LitElement {
    demoMode: "onboarding" | "signTransaction";
    private app;
    private web3Provider?;
    selectedAccount?: string;
    connectedCallback(): void;
    handleAnnounceProvider: (e: Event) => void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    createApp(): void;
    requestAccounts: () => Promise<void>;
    sendTransaction: () => Promise<void>;
    render(): import('lit').TemplateResult<1>;
}
//# sourceMappingURL=ledger-button-playground.d.ts.map