import { LitElement } from 'lit';
import { DeviceModelId } from '../../../components/atom/icon/device-icon/device-icon.js';
export type AnimationKey = "pin" | "pairing" | "pairingSuccess" | "frontView" | "continueOnLedger" | "signTransaction";
export declare const animationDataMap: Record<DeviceModelId, Record<AnimationKey, object | null>>;
export declare class LedgerDeviceAnimation extends LitElement {
    modelId: DeviceModelId;
    animation: AnimationKey;
    autoplay: boolean;
    loop: boolean;
    render(): import('lit').TemplateResult<1>;
}
//# sourceMappingURL=device-animation.d.ts.map