import { ReactiveController, ReactiveControllerHost } from 'lit';
import { CoreContext } from '../../../context/core-context.js';
import { LanguageContext } from '../../../context/language-context.js';
export declare class SelectDeviceController implements ReactiveController {
    private readonly host;
    private readonly core;
    private readonly lang;
    errorData?: {
        message: string;
        title: string;
        cta1?: {
            label: string;
            action: () => void | Promise<void>;
        };
        cta2?: {
            label: string;
            action: () => void | Promise<void>;
        };
    };
    constructor(host: ReactiveControllerHost, core: CoreContext, lang: LanguageContext);
    hostConnected(): void;
    clickAdItem(): Promise<void>;
    private mapErrors;
    connectToDevice(detail: {
        title: string;
        connectionType: "bluetooth" | "usb" | "";
        timestamp: number;
    }): Promise<void>;
}
//# sourceMappingURL=select-device-controller.d.ts.map