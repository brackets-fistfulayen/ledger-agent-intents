/**
 * Network constants for Alpaca integration
 *
 * Maps Ethereum chain IDs to Alpaca network names for gas fee estimation.
 * Based on Alpaca's supported networks documentation:
 * https://alpaca.api.ledger.com/docs/#tag/network/get/networks
 */
export declare const ALPACA_CHAIN_ID_TO_NETWORK: Record<string, string>;
/**
 * Gets the Alpaca network name for a given chain ID
 * @param chainId - The blockchain chain ID as string
 * @returns The Alpaca network name or undefined if not supported
 */
export declare function getAlpacaNetworkName(chainId: string): string | undefined;
//# sourceMappingURL=networkConstants.d.ts.map