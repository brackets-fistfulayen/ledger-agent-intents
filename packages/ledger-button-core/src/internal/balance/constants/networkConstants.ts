/**
 * Network constants for Alpaca integration
 * 
 * Maps Ethereum chain IDs to Alpaca network names for gas fee estimation.
 * Based on Alpaca's supported networks documentation:
 * https://alpaca.api.ledger.com/docs/#tag/network/get/networks
 */

export const ALPACA_CHAIN_ID_TO_NETWORK: Record<string, string> = {
  "1": "ethereum",
  "61": "ethereum_classic",
  "17000": "ethereum_holesky",
  "11155111": "ethereum_sepolia",
  "42161": "arbitrum",
  "421614": "arbitrum_sepolia",
  "592": "astar",
  "43114": "avalanche_c_chain",
  "8453": "base",
  "84532": "base_sepolia",
  "80094": "berachain",
  "199": "bittorrent",
  "81457": "blast",
  "168587773": "blast_sepolia",
  "288": "boba",
  "56": "bsc",
  "25": "cronos",
  "246": "energy_web",
  "128123": "etherlink",
  "250": "fantom",
  "14": "flare",
  "295": "hedera",
  "296": "hedera-testnet",
  "998": "hyperevm",
  "8217": "klaytn",
  "59144": "linea",
  "59141": "linea_sepolia",
  "42": "lukso",
  "1088": "metis",
  "1284": "moonbeam",
  "1285": "moonriver",
  "245022934": "neon_evm",
  "10": "optimism",
  "11155420": "optimism_sepolia",
  "137": "polygon",
  "1101": "polygon_zk_evm",
  "2442": "polygon_zk_evm_testnet",
  "30": "rsk",
  "534352": "scroll",
  "534351": "scroll_sepolia",
  "1329": "sei_network_evm",
  "19": "songbird",
  "146": "sonic",
  "57054": "syscoin",
  "40": "telos_evm",
  "106": "velas_evm",
  "324": "zksync",
  "300": "zksync_sepolia",
};

/**
 * Gets the Alpaca network name for a given chain ID
 * @param chainId - The blockchain chain ID as string
 * @returns The Alpaca network name or undefined if not supported
 */
export function getAlpacaNetworkName(chainId: string): string | undefined {
  return ALPACA_CHAIN_ID_TO_NETWORK[chainId];
}