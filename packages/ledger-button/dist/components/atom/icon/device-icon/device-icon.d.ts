import { LitElement } from 'lit';
export type DeviceModelId = "stax" | "flex" | "nanoS" | "nanoSP" | "nanoX" | "apexp";
export declare class DeviceIcon extends LitElement {
    modelId: DeviceModelId;
    private get iconContainerClass();
    private getIcon;
    render(): import('lit').TemplateResult<1>;
}
//# sourceMappingURL=device-icon.d.ts.map