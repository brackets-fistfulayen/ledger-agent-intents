import { LitElement } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
import { TurnOnSyncDesktopController } from './turn-on-sync-desktop-controller.js';
export declare class TurnOnSyncDesktopScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languageContext: LanguageContext;
    controller: TurnOnSyncDesktopController;
    connectedCallback(): void;
    private handleLedgerSyncActivated;
    private handleTurnOnLedgerSync;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "turn-on-sync-desktop-screen": TurnOnSyncDesktopScreen;
    }
}
//# sourceMappingURL=turn-on-sync-desktop.d.ts.map