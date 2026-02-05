import { EventRequest, WalletActionType } from '../backend/model/trackEvent.js';
export declare function normalizeTransactionHash(hash: string): string;
interface BaseEventParams {
    dAppId: string;
}
interface SessionEventParams extends BaseEventParams {
    sessionId: string;
    trustChainId?: string;
}
interface TransactionEventParams extends SessionEventParams {
    unsignedTransactionHash: string;
    chainId: string | null;
}
export declare function stringToSha256(string: string): string;
export declare class EventTrackingUtils {
    static validateEvent(event: EventRequest): {
        success: boolean;
        errors?: Array<{
            path: string;
            message: string;
        }>;
    };
    static createOpenSessionEvent(params: SessionEventParams): EventRequest;
    static createOpenLedgerSyncEvent(params: SessionEventParams): EventRequest;
    static createLedgerSyncActivatedEvent(params: SessionEventParams): EventRequest;
    static createConsentGivenEvent(params: SessionEventParams): EventRequest;
    static createFloatingButtonClickEvent(params: SessionEventParams): EventRequest;
    static createOnboardingEvent(params: SessionEventParams & {
        accountCurrency: string;
        accountBalance: string;
        chainId: string | null;
    }): EventRequest;
    static createTransactionFlowInitializationEvent(params: TransactionEventParams): EventRequest;
    static createTransactionFlowCompletionEvent(params: TransactionEventParams & {
        transactionHash: string;
    }): EventRequest;
    static createSessionAuthenticationEvent(params: TransactionEventParams & {
        transactionHash: string;
    }): EventRequest;
    static createInvoicingTransactionSignedEvent(params: SessionEventParams & {
        transactionHash: string;
        unsignedTransactionHash: string;
        chainId: string | null;
        recipientAddress: string;
    }): EventRequest;
    static createTypedMessageFlowInitializationEvent(params: {
        dAppId: string;
        sessionId: string;
        trustChainId?: string;
        typedMessageHash: string;
        chainId: string;
    }): EventRequest;
    static createTypedMessageFlowCompletionEvent(params: {
        dAppId: string;
        sessionId: string;
        trustChainId?: string;
        typedMessageHash: string;
        chainId: string;
    }): EventRequest;
    static createWalletActionClickedEvent(params: SessionEventParams & {
        walletAction: WalletActionType;
    }): EventRequest;
    static createWalletRedirectConfirmedEvent(params: SessionEventParams & {
        walletAction: WalletActionType;
    }): EventRequest;
    static createWalletRedirectCancelledEvent(params: SessionEventParams & {
        walletAction: WalletActionType;
    }): EventRequest;
}
export {};
//# sourceMappingURL=EventTrackingUtils.d.ts.map