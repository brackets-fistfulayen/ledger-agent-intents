import { LitElement } from 'lit';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
import { SigningFlowController } from './signing-flow-controller.js';
export declare class SigningFlow extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    coreContext: CoreContext;
    languages: LanguageContext;
    controller: SigningFlowController;
    connectedCallback(): void;
    render(): import('lit').TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "signing-flow": SigningFlow;
    }
}
//# sourceMappingURL=signing-flow.d.ts.map