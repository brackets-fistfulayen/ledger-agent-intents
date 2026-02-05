import { describe, expect, it } from "vitest";

import { isSupportedChainId } from "./supportedChains.js";

describe("supportedChains", () => {
  describe("isSupportedChainId", () => {
    describe("valid chain IDs", () => {
      it.each([
        ["1", "Ethereum mainnet"],
        ["42161", "Arbitrum One"],
        ["43114", "Avalanche C-Chain"],
        ["8453", "Base"],
        ["56", "BNB Smart Chain"],
        ["59144", "Linea"],
        ["10", "Optimism"],
        ["137", "Polygon"],
        ["146", "Sonic"],
        ["324", "ZKSync"],
      ])("should return true for %s (%s)", (chainId) => {
        expect(isSupportedChainId(chainId)).toBe(true);
      });
    });

    describe("edge cases", () => {
      it.each([[""], ["01"], [" 1 "], ["abc"], ["-1"]])(
        'should return false for "%s"',
        (chainId) => {
          expect(isSupportedChainId(chainId)).toBe(false);
        },
      );
    });
  });
});
