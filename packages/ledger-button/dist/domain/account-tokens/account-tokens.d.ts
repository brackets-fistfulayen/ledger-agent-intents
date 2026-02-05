import { Account } from '@ledgerhq/ledger-wallet-provider-core';
import { LitElement } from 'lit';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
import { AccountTokenController } from './account-token-controller.js';
export declare class AccountTokensScreen extends LitElement {
    navigation: Navigation;
    controller: AccountTokenController;
    connectedCallback(): void;
    coreContext: CoreContext;
    languages: LanguageContext;
    private formatAddress;
    private renderTokenItem;
    private renderConnectButton;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "account-tokens-screen": AccountTokensScreen;
    }
    interface WindowEventMap {
        "ledger-internal-account-selected": CustomEvent<{
            account: Account;
            status: "success";
        } | {
            status: "error";
            error: unknown;
        }>;
    }
}
//# sourceMappingURL=account-tokens.d.ts.map