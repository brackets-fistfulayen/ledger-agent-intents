export declare enum EventType {
    ConsentGiven = "consent_given",
    ErrorOccurred = "error_occurred",
    FloatingButtonClick = "floating_button_clicked",
    InvoicingTransactionSigned = "invoicing_transaction_signed",
    LedgerSyncActivated = "ledger_sync_activated",
    Onboarding = "onboarding",
    OpenLedgerSync = "open_ledger_sync",
    OpenSession = "open_session",
    SessionAuthentication = "session_authentication",
    TransactionFlowCompletion = "transaction_flow_completion",
    TransactionFlowInitialization = "transaction_flow_initialization",
    TypedMessageFlowCompletion = "typed_message_flow_completion",
    TypedMessageFlowInitialization = "typed_message_flow_initialization",
    WalletActionClicked = "wallet_action_clicked",
    WalletRedirectConfirmed = "wallet_redirect_confirmed",
    WalletRedirectCancelled = "wallet_redirect_cancelled"
}
type BaseEventData = {
    event_id: string;
    transaction_dapp_id: string;
    timestamp_ms: number;
};
export type InvoicingTransactionSignedEventData = BaseEventData & {
    event_type: "invoicing_transaction_signed";
    ledger_sync_user_id?: string;
    blockchain_network_selected: "ethereum";
    chain_id: string | null;
    transaction_hash: string;
    recipient_address: string;
    unsigned_transaction_hash: string;
};
export type ConsentGivenEventData = BaseEventData & {
    event_type: "consent_given";
};
export type OpenSessionEventData = BaseEventData & {
    event_type: "open_session";
    session_id: string;
};
export type OpenLedgerSyncEventData = BaseEventData & {
    event_type: "open_ledger_sync";
    session_id: string;
};
export type LedgerSyncActivatedEventData = BaseEventData & {
    event_type: "ledger_sync_activated";
    session_id: string;
    ledger_sync_user_id?: string;
};
export type OnboardingEventData = BaseEventData & {
    event_type: "onboarding";
    session_id: string;
    ledger_sync_user_id?: string;
    blockchain_network_selected: "ethereum";
    chain_id: string | null;
    account_currency: string;
    account_balance: string;
};
export type TransactionFlowInitializationEventData = BaseEventData & {
    event_type: "transaction_flow_initialization";
    session_id: string;
    ledger_sync_user_id?: string;
    blockchain_network_selected: "ethereum";
    chain_id: string | null;
    unsigned_transaction_hash: string;
};
export type TransactionFlowCompletionEventData = BaseEventData & {
    event_type: "transaction_flow_completion";
    session_id: string;
    ledger_sync_user_id?: string;
    blockchain_network_selected: "ethereum";
    chain_id: string | null;
    unsigned_transaction_hash: string;
    transaction_hash: string;
};
export type SessionAuthenticationEventData = BaseEventData & {
    event_type: "session_authentication";
    session_id: string;
    ledger_sync_user_id?: string;
    blockchain_network_selected: "ethereum";
    unsigned_transaction_hash: string;
    transaction_type: "authentication_tx";
    transaction_hash: string;
};
export type TypedMessageFlowInitializationEventData = BaseEventData & {
    event_type: "typed_message_flow_initialization";
    session_id: string;
    ledger_sync_user_id?: string;
    blockchain_network_selected: "ethereum";
    chain_id: string | null;
    typed_message_hash: string;
};
export type TypedMessageFlowCompletionEventData = BaseEventData & {
    event_type: "typed_message_flow_completion";
    session_id: string;
    ledger_sync_user_id?: string;
    blockchain_network_selected: "ethereum";
    chain_id: string | null;
    typed_message_hash: string;
};
export type ErrorOccurredEventData = BaseEventData & {
    event_type: "error_occurred";
    session_id: string;
    error_type: string;
    error_code: string | undefined;
    error_message: string;
    error_category: string;
    error_data?: Record<string, unknown>;
};
export type FloatingButtonClickEventData = BaseEventData & {
    event_type: "floating_button_clicked";
    session_id: string;
};
export type WalletActionType = "send" | "receive" | "swap" | "buy" | "earn" | "sell";
export type WalletActionClickedEventData = BaseEventData & {
    event_type: "wallet_action_clicked";
    session_id: string;
    wallet_action: WalletActionType;
};
export type WalletRedirectConfirmedEventData = BaseEventData & {
    event_type: "wallet_redirect_confirmed";
    session_id: string;
    wallet_action: WalletActionType;
};
export type WalletRedirectCancelledEventData = BaseEventData & {
    event_type: "wallet_redirect_cancelled";
    session_id: string;
    wallet_action: WalletActionType;
};
export type EventData = ConsentGivenEventData | ErrorOccurredEventData | InvoicingTransactionSignedEventData | FloatingButtonClickEventData | OpenSessionEventData | OpenLedgerSyncEventData | LedgerSyncActivatedEventData | OnboardingEventData | OpenLedgerSyncEventData | OpenSessionEventData | SessionAuthenticationEventData | TransactionFlowCompletionEventData | TransactionFlowInitializationEventData | TypedMessageFlowCompletionEventData | TypedMessageFlowInitializationEventData | WalletActionClickedEventData | WalletRedirectConfirmedEventData | WalletRedirectCancelledEventData;
export type EventRequest = {
    name: string;
    type: EventType;
    data: EventData;
};
export type EventResponseSuccess = {
    EventResponseSuccess: {
        success: true;
    };
};
export type EventResponseError = {
    time: null;
    message: string;
    status: number;
    type: string;
};
export type EventResponse = EventResponseSuccess | EventResponseError;
export {};
//# sourceMappingURL=trackEvent.d.ts.map