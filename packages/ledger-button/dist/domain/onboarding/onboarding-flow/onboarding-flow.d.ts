import { LitElement } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destinations } from '../../../shared/routes.js';
import { OnboardingFlowController } from './onboarding-flow-controller.js';
export declare class OnboardingFlow extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languages: LanguageContext;
    controller: OnboardingFlowController;
    connectedCallback(): void;
    render(): import('lit').TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "onboarding-flow": OnboardingFlow;
    }
}
//# sourceMappingURL=onboarding-flow.d.ts.map