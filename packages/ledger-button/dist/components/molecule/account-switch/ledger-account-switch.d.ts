import { LitElement } from 'lit';
export declare class LedgerAccountSwitch extends LitElement {
    account?: {
        id: string;
        currencyId: string;
        freshAddress: string;
        seedIdentifier: string;
        derivationMode: string;
        index: number;
        name: string;
    };
    private handleClick;
    private formatAddress;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-account-switch": LedgerAccountSwitch;
    }
    interface WindowEventMap {
        "account-switch": CustomEvent<{
            account: LedgerAccountSwitch["account"];
        }>;
    }
}
//# sourceMappingURL=ledger-account-switch.d.ts.map