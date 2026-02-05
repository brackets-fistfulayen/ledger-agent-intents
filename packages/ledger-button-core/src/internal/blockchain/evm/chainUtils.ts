export function getChainIdFromCurrencyId(currencyId: string) {
  return EVM_MAPPING_TABLE[currencyId] ?? 1;
}

export function getCurrencyIdFromChainId(chainId: number) {
  return Object.keys(EVM_MAPPING_TABLE).find(
    (currencyId) => EVM_MAPPING_TABLE[currencyId] === chainId,
  );
}

export const EVM_MAPPING_TABLE: Record<string, number> = {
  ethereum: 1,
  arbitrum: 42161,
  avalanche_c_chain: 43114,
  base: 8453,
  bsc: 56,
  linea: 59144,
  optimism: 10,
  polygon: 137,
  sonic: 146,
  zksync: 324,
};
