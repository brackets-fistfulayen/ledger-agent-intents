import { getChainIdFromCurrencyId } from "./chainUtils.js";

describe("chainUtils", () => {
  describe("getChainIdFromCurrencyId", () => {
    it.each([
      { currencyId: "ethereum", chainId: 1 },
      { currencyId: "arbitrum", chainId: 42161 },
      { currencyId: "avalanche_c_chain", chainId: 43114 },
      { currencyId: "base", chainId: 8453 },
      { currencyId: "bsc", chainId: 56 },
      { currencyId: "linea", chainId: 59144 },
      { currencyId: "optimism", chainId: 10 },
      { currencyId: "polygon", chainId: 137 },
      { currencyId: "sonic", chainId: 146 },
      { currencyId: "zksync", chainId: 324 },
    ])(
      "should return chain ID $chainId for $currencyId",
      ({ currencyId, chainId }) => {
        const result = getChainIdFromCurrencyId(currencyId);
        expect(result).toBe(chainId);
      },
    );

    it.each([
      { currencyId: "unknown-currency", description: "unknown currency" },
      { currencyId: "", description: "empty string" },
      { currencyId: "solana", description: "non-existent currency" },
      { currencyId: "Ethereum", description: "incorrect casing" },
      { currencyId: "eth@reum", description: "special characters" },
    ])(
      "should return default chain ID 1 for $description",
      ({ currencyId }) => {
        const result = getChainIdFromCurrencyId(currencyId);
        expect(result).toBe(1);
      },
    );
  });
});
