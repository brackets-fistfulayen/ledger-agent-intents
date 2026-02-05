import { Left, Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as chainUtils from "../../../blockchain/evm/chainUtils.js";
import type { Config } from "../../../config/model/config.js";
import type { NetworkService } from "../../../network/NetworkService.js";
import type { CalTokenResponse } from "./calTypes.js";
import { DefaultCalDataSource } from "./DefaultCalDataSource.js";

describe("DefaultCalDataSource", () => {
  let dataSource: DefaultCalDataSource;
  let mockNetworkService: NetworkService<unknown>;
  let mockConfig: Config;

  const mockCalUrl = "https://api.cal.test";
  const testTokenAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const testCurrencyId = "ethereum";
  const testChainId = 1;

  beforeEach(() => {
    mockNetworkService = {
      get: vi.fn(),
      post: vi.fn(),
    } as unknown as NetworkService<unknown>;

    mockConfig = {
      getCalUrl: vi.fn().mockReturnValue(mockCalUrl),
    } as unknown as Config;

    vi.spyOn(chainUtils, "getChainIdFromCurrencyId").mockReturnValue(
      testChainId,
    );

    dataSource = new DefaultCalDataSource(mockNetworkService, mockConfig);
  });

  describe("getTokenInformation", () => {
    const mockUSDTResponse: CalTokenResponse = [
      {
        id: "ethereum/erc20/usd_tether__erc20_",
        decimals: 6,
        ticker: "USDT",
        name: "Tether USD",
      },
    ];
    it("should successfully call the CAL API to get token information", async () => {
      vi.mocked(mockNetworkService.get).mockResolvedValue(
        Right(mockUSDTResponse),
      );

      const result = await dataSource.getTokenInformation(
        testTokenAddress,
        testCurrencyId,
      );

      expect(mockNetworkService.get).toHaveBeenCalledWith(
        `${mockCalUrl}/v1/tokens?contract_address=${testTokenAddress}&chain_id=${testChainId}&output=id,name,decimals,ticker`,
      );

      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const tokenInfo = result.extract();
        expect(tokenInfo).toEqual(mockUSDTResponse[0]);
      }
    });

    it("should return Left when network service returns Left", async () => {
      const networkError = new Error("Network request failed");
      vi.mocked(mockNetworkService.get).mockResolvedValue(Left(networkError));

      const result = await dataSource.getTokenInformation(
        testTokenAddress,
        testCurrencyId,
      );

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        const error = result.extract() as Error;
        expect(error.message).toBe(
          "Failed to fetch token information from Cal",
        );
      }
    });
    it("should return Left when response array is empty", async () => {
      vi.mocked(mockNetworkService.get).mockResolvedValue(Right([]));

      const result = await dataSource.getTokenInformation(
        testTokenAddress,
        testCurrencyId,
      );

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        const error = result.extract() as Error;
        expect(error.message).toBe("No token information found in Cal");
      }
    });
  });
});
