export type TrackedErrorType = "DeviceConnectionError" | "DeviceNotSupportedError" | "DeviceDisconnectedError" | "SignTransactionError" | "FailToOpenAppError" | "UserRejectedTransactionError" | "IncorrectSeedError" | "AccountNotSelectedError" | "BlindSigningDisabledError" | "TransactionValidationError" | "LedgerSyncConnectionError" | "LedgerSyncAuthenticationError" | "LedgerKeyringProtocolError" | "LedgerSyncConnectionFailedError" | "LedgerSyncError" | "LedgerSyncAuthContextMissingError" | "LedgerSyncNoSessionIdError";
export declare const ERROR_TRACKING_WHITELIST: Set<TrackedErrorType>;
export declare function shouldTrackError(errorType: string): boolean;
export interface ErrorTrackingConfig {
    enabled: boolean;
    useWhitelist: boolean;
    whitelist: Set<string>;
}
export declare const DEFAULT_ERROR_TRACKING_CONFIG: ErrorTrackingConfig;
//# sourceMappingURL=ErrorTrackingConfig.d.ts.map