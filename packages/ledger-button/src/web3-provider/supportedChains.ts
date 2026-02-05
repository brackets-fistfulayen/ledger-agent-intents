/**
 * Supported Chain IDs for Ledger EIP-1193 Provider
 *
 * This module manages the list of supported blockchain chain IDs
 * and provides utilities to check chain support.
 */

// TODO: complete with Node JSON rpc methods that can be broadcasted and directly handled by node

export const SUPPORTED_CHAIN_IDS = [
  "1",
  "42161",
  "43114",
  "8453",
  "56",
  "59144",
  "10",
  "137",
  "146",
  "324",
];

/**
 * Checks if a chain ID is supported by the Ledger EIP-1193 Provider
 *
 * @param chainId - The chain ID to check (as a string)
 * @returns `true` if the chain ID is supported, `false` otherwise
 */
export function isSupportedChainId(chainId: string): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}
