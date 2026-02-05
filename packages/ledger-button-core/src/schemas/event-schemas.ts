import { z } from "zod";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const hexPattern = /^[0-9a-f]+$/;
const nonNegativeIntegerPattern = /^([1-9][0-9]*|0)$/;

const BaseEventDataSchema = z.object({
  event_id: z.string().regex(uuidPattern, "Invalid UUID format"),
  transaction_dapp_id: z.string(),
  timestamp_ms: z.number().int().nonnegative(),
});

/**
 * Matches: ./sre-bento/containers/ledger-button-invoicing-events/config/schema.json
 */
export const InvoicingTransactionSignedEventSchema = BaseEventDataSchema.extend(
  {
    event_type: z.literal("invoicing_transaction_signed"),
    ledger_sync_user_id: z.string().optional(),
    blockchain_network_selected: z.enum(["ethereum"]),
    transaction_hash: z
      .string()
      .regex(
        hexPattern,
        "Transaction hash must be lowercase hex without 0x prefix",
      ),
    recipient_address: z.string(),
    unsigned_transaction_hash: z
      .string()
      .regex(hexPattern, "Sha256 hash without 0x prefix"),
  },
);

/**
 * Matches: ./sre-bento/containers/ledger-button-product-analytics-events/config/schema.json
 */
export const ConsentGivenEventSchema = BaseEventDataSchema.extend({
  event_type: z.literal("consent_given"),
});

export const FloatingButtonClickEventSchema = BaseEventDataSchema.extend({
  event_type: z.literal("floating_button_clicked"),
  session_id: z.string().regex(uuidPattern, "Invalid UUID format"),
});

export const OpenSessionEventSchema = BaseEventDataSchema.extend({
  event_type: z.literal("open_session"),
  session_id: z.string().regex(uuidPattern, "Invalid UUID format"),
});

export const OpenLedgerSyncEventSchema = BaseEventDataSchema.extend({
  event_type: z.literal("open_ledger_sync"),
  session_id: z.string().regex(uuidPattern, "Invalid UUID format"),
});

export const LedgerSyncActivatedEventSchema = BaseEventDataSchema.extend({
  event_type: z.literal("ledger_sync_activated"),
  session_id: z.string().regex(uuidPattern, "Invalid UUID format"),
  ledger_sync_user_id: z.string().optional(),
});

export const OnboardingEventSchema = BaseEventDataSchema.extend({
  event_type: z.literal("onboarding"),
  session_id: z.string().regex(uuidPattern, "Invalid UUID format"),
  ledger_sync_user_id: z.string().optional(),
  blockchain_network_selected: z.enum(["ethereum"]),
  account_currency: z.string(),
  account_balance: z
    .string()
    .regex(
      nonNegativeIntegerPattern,
      "Account balance must be a non-negative integer string",
    ),
});

export const TransactionFlowInitializationEventSchema =
  BaseEventDataSchema.extend({
    event_type: z.literal("transaction_flow_initialization"),
    session_id: z.string().regex(uuidPattern, "Invalid UUID format"),
    ledger_sync_user_id: z.string().optional(),
    blockchain_network_selected: z.enum(["ethereum"]),
    unsigned_transaction_hash: z
      .string()
      .regex(hexPattern, "Sha256 hash without 0x prefix"),
  });

export const TransactionFlowCompletionEventSchema = BaseEventDataSchema.extend({
  event_type: z.literal("transaction_flow_completion"),
  session_id: z.string().regex(uuidPattern, "Invalid UUID format"),
  ledger_sync_user_id: z.string().optional(),
  blockchain_network_selected: z.enum(["ethereum"]),
  unsigned_transaction_hash: z
    .string()
    .regex(hexPattern, "Sha256 hash without 0x prefix"),
  transaction_hash: z
    .string()
    .regex(
      hexPattern,
      "Transaction hash must be lowercase hex without 0x prefix",
    ),
});

export const SessionAuthenticationEventSchema = BaseEventDataSchema.extend({
  event_type: z.literal("session_authentication"),
  session_id: z.string().regex(uuidPattern, "Invalid UUID format"),
  ledger_sync_user_id: z.string().optional(),
  blockchain_network_selected: z.enum(["ethereum"]),
  unsigned_transaction_hash: z
    .string()
    .regex(
      hexPattern,
      "Unsigned transaction hash must be lowercase hex without 0x prefix",
    ),
  transaction_type: z.literal("authentication_tx"),
  transaction_hash: z
    .string()
    .regex(
      hexPattern,
      "Transaction hash must be lowercase hex without 0x prefix",
    ),
});

export const EventDataSchema = z.discriminatedUnion("event_type", [
  InvoicingTransactionSignedEventSchema,
  ConsentGivenEventSchema,
  FloatingButtonClickEventSchema,
  OpenSessionEventSchema,
  OpenLedgerSyncEventSchema,
  LedgerSyncActivatedEventSchema,
  OnboardingEventSchema,
  TransactionFlowInitializationEventSchema,
  TransactionFlowCompletionEventSchema,
  SessionAuthenticationEventSchema,
]);

export type InvoicingTransactionSignedEvent = z.infer<
  typeof InvoicingTransactionSignedEventSchema
>;
export type ConsentGivenEvent = z.infer<typeof ConsentGivenEventSchema>;
export type OpenSessionEvent = z.infer<typeof OpenSessionEventSchema>;
export type OpenLedgerSyncEvent = z.infer<typeof OpenLedgerSyncEventSchema>;
export type LedgerSyncActivatedEvent = z.infer<
  typeof LedgerSyncActivatedEventSchema
>;
export type OnboardingEvent = z.infer<typeof OnboardingEventSchema>;
export type TransactionFlowInitializationEvent = z.infer<
  typeof TransactionFlowInitializationEventSchema
>;
export type TransactionFlowCompletionEvent = z.infer<
  typeof TransactionFlowCompletionEventSchema
>;
export type SessionAuthenticationEvent = z.infer<
  typeof SessionAuthenticationEventSchema
>;
export type EventData = z.infer<typeof EventDataSchema>;
