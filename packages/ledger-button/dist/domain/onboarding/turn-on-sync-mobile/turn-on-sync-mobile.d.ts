import { LitElement } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
import { TurnOnSyncMobileController } from './turn-on-sync-mobile-controller.js';
export declare class TurnOnSyncMobileScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languageContext: LanguageContext;
    controller: TurnOnSyncMobileController;
    connectedCallback(): void;
    private handleLedgerSyncActivated;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "turn-on-sync-mobile-screen": TurnOnSyncMobileScreen;
    }
}
//# sourceMappingURL=turn-on-sync-mobile.d.ts.map