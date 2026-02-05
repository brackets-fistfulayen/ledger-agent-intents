import { LitElement } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
export declare class WelcomeScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languages: LanguageContext;
    private isHowItWorksExpanded;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private updateModalHeight;
    private toggleHowItWorks;
    private handleContinue;
    private renderFeatureItem;
    private renderHowItWorksCard;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "welcome-screen": WelcomeScreen;
    }
}
//# sourceMappingURL=welcome-screen.d.ts.map