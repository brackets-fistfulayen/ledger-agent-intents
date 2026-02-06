import { ConnectedDevice, DeviceModelId } from '@ledgerhq/device-management-kit';
export declare class Device {
    private readonly _connectedDevice;
    constructor(_connectedDevice: ConnectedDevice);
    get name(): string;
    get modelId(): DeviceModelId;
    get sessionId(): string;
    get type(): import('@ledgerhq/device-management-kit').ConnectionType;
    get iconType(): "nanox" | "stax" | "flex" | "apexp";
}
//# sourceMappingURL=Device.d.ts.map