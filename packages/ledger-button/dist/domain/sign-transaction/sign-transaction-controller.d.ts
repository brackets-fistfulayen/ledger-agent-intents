import { SignedResults, SignPersonalMessageParams, SignRawTransactionParams, SignTransactionParams, SignTypedMessageParams } from '@ledgerhq/ledger-wallet-provider-core';
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { AnimationKey } from '../../components/index.js';
import { CoreContext } from '../../context/core-context.js';
import { LanguageContext } from '../../context/language-context.js';
import { Navigation } from '../../shared/navigation.js';
export type ScreenState = {
    screen: "signing";
    deviceAnimation: Omit<AnimationKey, "pairing" | "pairingSuccess" | "frontView">;
} | {
    screen: "success";
    status: StatusState;
} | {
    screen: "error";
    status: StatusState;
};
export type StatusState = {
    message: string;
    title: string;
    cta1: {
        label: string;
        action: () => void | Promise<void>;
    };
    cta2?: {
        label: string;
        action: () => void | Promise<void>;
    };
};
export declare class SignTransactionController implements ReactiveController {
    private readonly core;
    private readonly navigation;
    private readonly lang;
    host: ReactiveControllerHost;
    private transactionSubscription?;
    private currentTransaction?;
    result?: SignedResults;
    state: ScreenState;
    constructor(host: ReactiveControllerHost, core: CoreContext, navigation: Navigation, lang: LanguageContext);
    hostConnected(): void;
    hostDisconnected(): void;
    private mapUserInteractionToDeviceAnimation;
    startSigning(transactionParams: SignTransactionParams | SignRawTransactionParams | SignTypedMessageParams | SignPersonalMessageParams): void;
    private getDeviceName;
    private mapSuccessToState;
    private mapErrors;
    getScanWebsiteUrl(chainId: number, transactionHash: string): string | null;
    viewTransactionDetails(url: string): void;
    close: () => void;
}
//# sourceMappingURL=sign-transaction-controller.d.ts.map