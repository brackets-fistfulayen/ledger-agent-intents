import { z } from 'zod';
/**
 * Matches: ./sre-bento/containers/ledger-button-invoicing-events/config/schema.json
 */
export declare const InvoicingTransactionSignedEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"invoicing_transaction_signed">;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    transaction_hash: z.ZodString;
    recipient_address: z.ZodString;
    unsigned_transaction_hash: z.ZodString;
}, z.core.$strip>;
/**
 * Matches: ./sre-bento/containers/ledger-button-product-analytics-events/config/schema.json
 */
export declare const ConsentGivenEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"consent_given">;
}, z.core.$strip>;
export declare const FloatingButtonClickEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"floating_button_clicked">;
    session_id: z.ZodString;
}, z.core.$strip>;
export declare const OpenSessionEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"open_session">;
    session_id: z.ZodString;
}, z.core.$strip>;
export declare const OpenLedgerSyncEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"open_ledger_sync">;
    session_id: z.ZodString;
}, z.core.$strip>;
export declare const LedgerSyncActivatedEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"ledger_sync_activated">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const OnboardingEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"onboarding">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    account_currency: z.ZodString;
    account_balance: z.ZodString;
}, z.core.$strip>;
export declare const TransactionFlowInitializationEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"transaction_flow_initialization">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    unsigned_transaction_hash: z.ZodString;
}, z.core.$strip>;
export declare const TransactionFlowCompletionEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"transaction_flow_completion">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    unsigned_transaction_hash: z.ZodString;
    transaction_hash: z.ZodString;
}, z.core.$strip>;
export declare const SessionAuthenticationEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"session_authentication">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    unsigned_transaction_hash: z.ZodString;
    transaction_type: z.ZodLiteral<"authentication_tx">;
    transaction_hash: z.ZodString;
}, z.core.$strip>;
export declare const EventDataSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"invoicing_transaction_signed">;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    transaction_hash: z.ZodString;
    recipient_address: z.ZodString;
    unsigned_transaction_hash: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"consent_given">;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"floating_button_clicked">;
    session_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"open_session">;
    session_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"open_ledger_sync">;
    session_id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"ledger_sync_activated">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"onboarding">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    account_currency: z.ZodString;
    account_balance: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"transaction_flow_initialization">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    unsigned_transaction_hash: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"transaction_flow_completion">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    unsigned_transaction_hash: z.ZodString;
    transaction_hash: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    event_id: z.ZodString;
    transaction_dapp_id: z.ZodString;
    timestamp_ms: z.ZodNumber;
    event_type: z.ZodLiteral<"session_authentication">;
    session_id: z.ZodString;
    ledger_sync_user_id: z.ZodOptional<z.ZodString>;
    blockchain_network_selected: z.ZodEnum<{
        ethereum: "ethereum";
    }>;
    unsigned_transaction_hash: z.ZodString;
    transaction_type: z.ZodLiteral<"authentication_tx">;
    transaction_hash: z.ZodString;
}, z.core.$strip>], "event_type">;
export type InvoicingTransactionSignedEvent = z.infer<typeof InvoicingTransactionSignedEventSchema>;
export type ConsentGivenEvent = z.infer<typeof ConsentGivenEventSchema>;
export type OpenSessionEvent = z.infer<typeof OpenSessionEventSchema>;
export type OpenLedgerSyncEvent = z.infer<typeof OpenLedgerSyncEventSchema>;
export type LedgerSyncActivatedEvent = z.infer<typeof LedgerSyncActivatedEventSchema>;
export type OnboardingEvent = z.infer<typeof OnboardingEventSchema>;
export type TransactionFlowInitializationEvent = z.infer<typeof TransactionFlowInitializationEventSchema>;
export type TransactionFlowCompletionEvent = z.infer<typeof TransactionFlowCompletionEventSchema>;
export type SessionAuthenticationEvent = z.infer<typeof SessionAuthenticationEventSchema>;
export type EventData = z.infer<typeof EventDataSchema>;
//# sourceMappingURL=event-schemas.d.ts.map