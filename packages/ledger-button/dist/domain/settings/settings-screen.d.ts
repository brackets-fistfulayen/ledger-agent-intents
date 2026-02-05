import { LitElement } from 'lit';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
export declare class SettingsScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languages: LanguageContext;
    private analyticsEnabled;
    connectedCallback(): Promise<void>;
    private handleToggleChange;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "settings-screen": SettingsScreen;
    }
}
//# sourceMappingURL=settings-screen.d.ts.map