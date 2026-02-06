import { LedgerButtonError } from '../../../api/errors/LedgerButtonError.js';
export declare class AlpacaNetworkError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class AlpacaInvalidAddressError extends LedgerButtonError {
    constructor(address: string, context?: Record<string, unknown>);
}
export declare class AlpacaUnsupportedChainError extends LedgerButtonError {
    constructor(currencyId: string, context?: Record<string, unknown>);
}
export declare class AlpacaApiError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class AlpacaBalanceFetchError extends LedgerButtonError {
    constructor(address: string, currencyId: string, context?: Record<string, unknown>);
}
export declare class AlpacaTokenFetchError extends LedgerButtonError {
    constructor(address: string, currencyId: string, context?: Record<string, unknown>);
}
export declare class AlpacaUnknownError extends LedgerButtonError {
    constructor(message: string, context?: Record<string, unknown>);
}
export declare class AlpacaFeeEstimationError extends LedgerButtonError {
    constructor(network: string, context?: Record<string, unknown>);
}
export type AlpacaServiceError = AlpacaNetworkError | AlpacaInvalidAddressError | AlpacaUnsupportedChainError | AlpacaApiError | AlpacaBalanceFetchError | AlpacaTokenFetchError | AlpacaFeeEstimationError | AlpacaUnknownError;
export declare const AlpacaServiceErrors: {
    networkError: (message: string, originalError?: unknown) => AlpacaNetworkError;
    invalidAddress: (address: string) => AlpacaInvalidAddressError;
    unsupportedChain: (currencyId: string) => AlpacaUnsupportedChainError;
    apiError: (message: string, originalError?: unknown) => AlpacaApiError;
    balanceFetchError: (address: string, currencyId: string, originalError?: unknown) => AlpacaBalanceFetchError;
    tokenFetchError: (address: string, currencyId: string, originalError?: unknown) => AlpacaTokenFetchError;
    feeEstimationError: (network: string, originalError?: unknown) => AlpacaFeeEstimationError;
    unknownError: (message: string, originalError?: unknown) => AlpacaUnknownError;
};
//# sourceMappingURL=error.d.ts.map