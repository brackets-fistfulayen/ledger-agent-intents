import { LitElement } from 'lit';
import { DeviceItemClickEventDetail } from '../../components/molecule/device-item/ledger-device-item.js';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destination, Destinations } from '../../shared/routes.js';
import { DeviceSwitchController } from './device-switch-controller.js';
export declare class DeviceSwitchScreen extends LitElement {
    navigation: Navigation;
    destinations: Destinations;
    navigateTo: (destination: Destination) => Promise<void>;
    coreContext: CoreContext;
    languageContext: LanguageContext;
    private isLoading;
    controller: DeviceSwitchController;
    connectedCallback(): void;
    handleDeviceItemClick: (e: CustomEvent<DeviceItemClickEventDetail>) => void;
    handleAddNewDevice: () => void;
    private renderDeviceList;
    private renderSeparator;
    private renderAddNewDeviceSection;
    render(): import('lit').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "device-switch-screen": DeviceSwitchScreen;
    }
}
export default DeviceSwitchScreen;
//# sourceMappingURL=device-switch.d.ts.map