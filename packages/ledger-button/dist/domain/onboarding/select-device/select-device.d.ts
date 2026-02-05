import { LitElement } from 'lit';
import { ConnectionItemClickEventDetail } from '../../../components/molecule/connection-item/ledger-connection-item.js';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
import { Navigation } from '../../../shared/navigation.js';
import { Destination, Destinations } from '../../../shared/routes.js';
import { SelectDeviceController } from './select-device-controller.js';
export declare class SelectDeviceScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    navigateTo: (destination: Destination) => Promise<void>;
    coreContext: CoreContext;
    languageContext: LanguageContext;
    controller: SelectDeviceController;
    connectedCallback(): void;
    handleConnectionItemClick: (e: CustomEvent<ConnectionItemClickEventDetail>) => void;
    handleAdItemClick: () => void;
    private handleStatusAction;
    renderScreen(): import('lit').TemplateResult<1>;
    renderErrorScreen(): import('lit').TemplateResult<1>;
    render(): import('lit').TemplateResult<1>;
}
//# sourceMappingURL=select-device.d.ts.map