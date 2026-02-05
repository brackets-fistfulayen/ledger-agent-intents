import { LitElement } from 'lit';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
export declare class TokenListScreen extends LitElement {
    coreContext: CoreContext;
    languages: LanguageContext;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleAccountsUpdated;
    private get selectedAccount();
    private get isLoading();
    private get tokens();
    private renderSkeletonItem;
    private renderSkeletonList;
    private renderEmptyState;
    private renderTokenList;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "token-list-screen": TokenListScreen;
    }
}
//# sourceMappingURL=token-list.d.ts.map