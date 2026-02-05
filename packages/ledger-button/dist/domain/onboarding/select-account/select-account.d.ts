import { Account } from '@ledgerhq/ledger-wallet-provider-core';
import { LitElement } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { SelectAccountController } from './select-account-controller.js';
export declare class SelectAccountScreen extends LitElement {
    navigation: Navigation;
    coreContext: CoreContext;
    languages: LanguageContext;
    controller: SelectAccountController;
    connectedCallback(): void;
    renderAccountItem: (account: Account) => import('lit').TemplateResult<1>;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "select-account-screen": SelectAccountScreen;
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
//# sourceMappingURL=select-account.d.ts.map