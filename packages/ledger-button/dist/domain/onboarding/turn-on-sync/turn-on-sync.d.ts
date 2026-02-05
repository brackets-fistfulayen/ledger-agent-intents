import { LitElement } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
import { TurnOnSyncController } from './turn-on-sync-controller.js';
export declare class TurnOnSyncScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languageContext: LanguageContext;
    controller: TurnOnSyncController;
    connectedCallback(): void;
    private handleActivateMobile;
    private handleActivateDesktop;
    private handleLearnMore;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "turn-on-sync-screen": TurnOnSyncScreen;
    }
}
//# sourceMappingURL=turn-on-sync.d.ts.map