import { TrackedErrorType } from "./config/ErrorTrackingConfig.js";
import { LedgerButtonError } from "../../api/errors/LedgerButtonError.js";
import {
  ErrorOccurredEventData,
  EventRequest,
  EventType,
} from "../backend/model/trackEvent.js";
import { generateUUID } from "./utils.js";

interface ErrorTrackingParams {
  error: Error;
  sessionId: string;
  dAppId: string;
  severity: "fatal" | "error";
}

const PII_FIELD_IDENTIFIERS = ["ledger_sync_id"] as const;

export const sanitizeContext = (
  context?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!context) return undefined;

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();

    if (
      PII_FIELD_IDENTIFIERS.some((identifier) => lowerKey.includes(identifier))
    ) {
      continue;
    }

    sanitized[key] = value;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};

const ERROR_CATEGORY_MAP: Record<TrackedErrorType, string> = {
  AccountNotSelectedError: "account",
  BlindSigningDisabledError: "blind-signing",
  DeviceConnectionError: "device",
  DeviceNotSupportedError: "device",
  DeviceDisconnectedError: "device",
  FailToOpenAppError: "device",
  IncorrectSeedError: "device",
  SignTransactionError: "transaction",
  UserRejectedTransactionError: "transaction",
  TransactionValidationError: "transaction",
  LedgerSyncConnectionError: "ledgersync",
  LedgerSyncAuthenticationError: "ledgersync",
  LedgerKeyringProtocolError: "ledgersync",
  LedgerSyncConnectionFailedError: "ledgersync",
  LedgerSyncError: "ledgersync",
  LedgerSyncAuthContextMissingError: "ledgersync",
  LedgerSyncNoSessionIdError: "ledgersync",
};

export const categorizeError = (error: Error): string => {
  const errorType = error.name as TrackedErrorType;
  return ERROR_CATEGORY_MAP[errorType] ?? "unknown";
};

export const createErrorEvent = (params: ErrorTrackingParams): EventRequest => {
  const { error, sessionId, dAppId } = params;

  const isLedgerButtonError = error instanceof LedgerButtonError;
  const context = isLedgerButtonError ? error.context : undefined;

  const data: ErrorOccurredEventData = {
    event_id: generateUUID(),
    transaction_dapp_id: dAppId,
    timestamp_ms: Date.now(),
    event_type: EventType.ErrorOccurred,
    session_id: sessionId,
    error_type: error.name,
    error_code: undefined, // TODO: Add when error codes are implemented
    error_message: error.message,
    error_category: categorizeError(error),
    error_data: sanitizeContext(context),
  };

  return {
    name: EventType.ErrorOccurred,
    type: EventType.ErrorOccurred,
    data,
  };
};
