import { LitElement } from 'lit';
import { StatusType } from '../../../components/index.js';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
import { LedgerSyncController } from './ledger-sync-controller.js';
export declare class LedgerSyncScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languages: LanguageContext;
    controller: LedgerSyncController;
    connectedCallback(): void;
    handleStatusAction: (e: CustomEvent<{
        timestamp: number;
        action: "primary" | "secondary";
        type: StatusType;
    }>) => void;
    renderNormalScreen(): import('lit').TemplateResult<1>;
    renderErrorScreen(): import('lit').TemplateResult<1>;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "ledger-sync-screen": LedgerSyncScreen;
    }
}
//# sourceMappingURL=ledger-sync.d.ts.map