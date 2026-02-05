import { LitElement } from 'lit';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destination, Destinations } from '../../shared/routes.js';
import { DeviceConnectionStatusController } from './device-connection-status-controller.js';
export declare class DeviceConnectionStatusScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    navigateTo: (destination: Destination) => Promise<void>;
    coreContext: CoreContext;
    languageContext: LanguageContext;
    private get deviceInfo();
    controller: DeviceConnectionStatusController;
    connectedCallback(): void;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "device-connection-status-screen": DeviceConnectionStatusScreen;
    }
}
export default DeviceConnectionStatusScreen;
//# sourceMappingURL=device-connection-status.d.ts.map