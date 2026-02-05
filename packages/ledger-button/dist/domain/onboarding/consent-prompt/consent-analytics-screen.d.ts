import { LitElement } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
export declare class ConsentAnalyticsScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languages: LanguageContext;
    private handleAccept;
    private handleRefuse;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "consent-analytics-screen": ConsentAnalyticsScreen;
    }
}
//# sourceMappingURL=consent-analytics-screen.d.ts.map