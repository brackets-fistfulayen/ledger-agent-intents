import { LitElement } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
import { RetrievingAccountsController } from './retrieving-accounts-controller.js';
export declare class RetrievingAccountsScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languages: LanguageContext;
    controller: RetrievingAccountsController;
    connectedCallback(): void;
    private handleStatusActionError;
    renderErrorScreen(): import('lit').TemplateResult<1>;
    renderScreen(): import('lit').TemplateResult<1>;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "retrieving-accounts-screen": RetrievingAccountsScreen;
    }
}
//# sourceMappingURL=retrieving-accounts.d.ts.map