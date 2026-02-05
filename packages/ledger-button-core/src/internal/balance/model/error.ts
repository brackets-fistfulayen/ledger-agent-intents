import { LedgerButtonError } from "../../../api/errors/LedgerButtonError.js";

export class AlpacaNetworkError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "AlpacaNetworkError", context);
  }
}

export class AlpacaInvalidAddressError extends LedgerButtonError {
  constructor(address: string, context?: Record<string, unknown>) {
    super(
      `Invalid address format: ${address}`,
      "AlpacaInvalidAddressError",
      { address, ...context }
    );
  }
}

export class AlpacaUnsupportedChainError extends LedgerButtonError {
  constructor(currencyId: string, context?: Record<string, unknown>) {
    super(
      `Unsupported chain: ${currencyId}`,
      "AlpacaUnsupportedChainError",
      { currencyId, ...context }
    );
  }
}

export class AlpacaApiError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "AlpacaApiError", context);
  }
}

export class AlpacaBalanceFetchError extends LedgerButtonError {
  constructor(
    address: string,
    currencyId: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Failed to fetch balance for address ${address} on ${currencyId}`,
      "AlpacaBalanceFetchError",
      { address, currencyId, ...context }
    );
  }
}

export class AlpacaTokenFetchError extends LedgerButtonError {
  constructor(
    address: string,
    currencyId: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Failed to fetch token balances for address ${address} on ${currencyId}`,
      "AlpacaTokenFetchError",
      { address, currencyId, ...context }
    );
  }
}

export class AlpacaUnknownError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "AlpacaUnknownError", context);
  }
}

export class AlpacaFeeEstimationError extends LedgerButtonError {
  constructor(
    network: string,
    context?: Record<string, unknown>
  ) {
    super(
      `Failed to estimate transaction fee for ${network}`,
      "AlpacaFeeEstimationError",
      { network, ...context }
    );
  }
}

export type AlpacaServiceError =
  | AlpacaNetworkError
  | AlpacaInvalidAddressError
  | AlpacaUnsupportedChainError
  | AlpacaApiError
  | AlpacaBalanceFetchError
  | AlpacaTokenFetchError
  | AlpacaFeeEstimationError
  | AlpacaUnknownError;

export const AlpacaServiceErrors = {
  networkError: (message: string, originalError?: unknown): AlpacaNetworkError =>
    new AlpacaNetworkError(message, { originalError }),

  invalidAddress: (address: string): AlpacaInvalidAddressError =>
    new AlpacaInvalidAddressError(address),

  unsupportedChain: (currencyId: string): AlpacaUnsupportedChainError =>
    new AlpacaUnsupportedChainError(currencyId),

  apiError: (message: string, originalError?: unknown): AlpacaApiError =>
    new AlpacaApiError(message, { originalError }),

  balanceFetchError: (
    address: string,
    currencyId: string,
    originalError?: unknown
  ): AlpacaBalanceFetchError =>
    new AlpacaBalanceFetchError(address, currencyId, { originalError }),

  tokenFetchError: (
    address: string,
    currencyId: string,
    originalError?: unknown
  ): AlpacaTokenFetchError =>
    new AlpacaTokenFetchError(address, currencyId, { originalError }),

  feeEstimationError: (
    network: string,
    originalError?: unknown
  ): AlpacaFeeEstimationError =>
    new AlpacaFeeEstimationError(network, { originalError }),

  unknownError: (message: string, originalError?: unknown): AlpacaUnknownError =>
    new AlpacaUnknownError(message, { originalError }),
};
