import { DiscoveredDevice } from '@ledgerhq/ledger-wallet-provider-core';
import { LitElement } from 'lit';
import { DeviceModelId } from '../../components/atom/icon/device-icon/device-icon.js';
import { CoreContext } from '../../context/core-context.js';
import { Navigation } from '../../shared/navigation.js';
import { Destinations } from '../../shared/routes.js';
export declare class DeviceSwitchController {
    private readonly host;
    private readonly coreContext;
    private readonly navigation;
    private readonly destinations;
    private devices;
    constructor(host: LitElement, coreContext: CoreContext, navigation: Navigation, destinations: Destinations);
    hostConnected(): Promise<void>;
    loadAvailableDevices(): Promise<void>;
    getDevices(): DiscoveredDevice[];
    connectToDevice(detail: {
        title: string;
        connectionType: "bluetooth" | "usb" | "";
        timestamp: number;
    }): Promise<void>;
    addNewDevice(): Promise<void>;
    getConnectionTypeFromTransport(transport: string): "bluetooth" | "usb" | "";
    mapDeviceModelId(deviceModelId?: string): DeviceModelId;
}
//# sourceMappingURL=device-switch-controller.d.ts.map