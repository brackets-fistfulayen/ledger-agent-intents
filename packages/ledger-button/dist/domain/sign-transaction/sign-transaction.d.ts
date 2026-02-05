import { SignedResults, SignPersonalMessageParams, SignRawTransactionParams, SignTransactionParams, SignTypedMessageParams } from '@ledgerhq/ledger-wallet-provider-core';
import { LitElement } from 'lit';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
import { SignTransactionController } from './sign-transaction-controller.js';
export declare class SignTransactionScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languageContext: LanguageContext;
    transactionParams?: SignTransactionParams | SignPersonalMessageParams | SignRawTransactionParams | SignTypedMessageParams;
    params?: unknown;
    broadcast: boolean;
    controller: SignTransactionController;
    connectedCallback(): void;
    private isParams;
    private renderSigningState;
    private renderStatusState;
    private handleStatusAction;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "sign-transaction-screen": SignTransactionScreen;
    }
    interface WindowEventMap {
        "ledger-internal-sign": CustomEvent<{
            status: "success";
            data: SignedResults;
        } | {
            status: "error";
            error: unknown;
        }>;
    }
}
//# sourceMappingURL=sign-transaction.d.ts.map