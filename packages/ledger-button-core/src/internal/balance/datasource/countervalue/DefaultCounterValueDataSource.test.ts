import { Either, Left, Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Config } from "../../../config/model/config.js";
import type { NetworkService } from "../../../network/NetworkService.js";
import type {
  CounterValuedResponse,
  CounterValueResult,
} from "./counterValueTypes.js";
import { DefaultCounterValueDataSource } from "./DefaultCounterValueDataSource.js";

const createMockResponse = (
  rates: Record<string, number>,
): CounterValuedResponse => rates;

const expectSuccessfulResult = (
  result: Either<Error, CounterValueResult[]>,
  expected: CounterValueResult[],
) => {
  expect(result.isRight()).toBe(true);
  expect(result.extract()).toEqual(expected);
};

describe("DefaultCounterValueDataSource", () => {
  let dataSource: DefaultCounterValueDataSource;
  let mockNetworkService: NetworkService<unknown>;
  let mockConfig: Config;

  const mockCounterValueUrl = "https://countervalue.api.test";

  beforeEach(() => {
    mockNetworkService = {
      get: vi.fn(),
      post: vi.fn(),
    } as unknown as NetworkService<unknown>;

    mockConfig = {
      getCounterValueUrl: vi.fn().mockReturnValue(mockCounterValueUrl),
    } as unknown as Config;

    dataSource = new DefaultCounterValueDataSource(
      mockNetworkService,
      mockConfig,
    );
  });

  describe("getCounterValues", () => {
    it("should return empty array when ledgerIds is empty", async () => {
      const result = await dataSource.getCounterValues([], "usd");

      expect(result.isRight()).toBe(true);
      expect(result.extract()).toEqual([]);
      expect(mockNetworkService.get).not.toHaveBeenCalled();
    });

    it("should successfully fetch counter values for single ledgerId", async () => {
      const mockResponse = createMockResponse({
        ethereum: 3200.5,
      });

      vi.mocked(mockNetworkService.get).mockResolvedValue(Right(mockResponse));

      const result = await dataSource.getCounterValues(["ethereum"], "usd");

      expect(mockNetworkService.get).toHaveBeenCalledWith(
        `${mockCounterValueUrl}/v3/spot/simple?froms=ethereum&to=usd`,
      );

      expectSuccessfulResult(result, [{ ledgerId: "ethereum", rate: 3200.5 }]);
    });

    it("should successfully fetch counter values for multiple ledgerIds", async () => {
      const mockResponse = createMockResponse({
        ethereum: 3200.5,
        "ethereum/erc20/usd_tether__erc20_": 1.0,
      });

      vi.mocked(mockNetworkService.get).mockResolvedValue(Right(mockResponse));

      const result = await dataSource.getCounterValues(
        ["ethereum", "ethereum/erc20/usd_tether__erc20_"],
        "usd",
      );

      expect(mockNetworkService.get).toHaveBeenCalledWith(
        `${mockCounterValueUrl}/v3/spot/simple?froms=ethereum%2Cethereum%2Ferc20%2Fusd_tether__erc20_&to=usd`,
      );

      expectSuccessfulResult(result, [
        { ledgerId: "ethereum", rate: 3200.5 },
        { ledgerId: "ethereum/erc20/usd_tether__erc20_", rate: 1.0 },
      ]);
    });

    it("should return rate 0 for ledgerIds not found in response", async () => {
      const mockResponse = createMockResponse({
        ethereum: 3200.5,
      });

      vi.mocked(mockNetworkService.get).mockResolvedValue(Right(mockResponse));

      const result = await dataSource.getCounterValues(
        ["ethereum", "unknown-token"],
        "usd",
      );

      expectSuccessfulResult(result, [
        { ledgerId: "ethereum", rate: 3200.5 },
        { ledgerId: "unknown-token", rate: 0 },
      ]);
    });

    it("should return rate 0 when rates object is undefined", async () => {
      const mockResponse = {} as CounterValuedResponse;

      vi.mocked(mockNetworkService.get).mockResolvedValue(Right(mockResponse));

      const result = await dataSource.getCounterValues(["ethereum"], "usd");

      expectSuccessfulResult(result, [{ ledgerId: "ethereum", rate: 0 }]);
    });

    it("should return Left when network service returns Left", async () => {
      const networkError = new Error("Network request failed");
      vi.mocked(mockNetworkService.get).mockResolvedValue(Left(networkError));

      const result = await dataSource.getCounterValues(["ethereum"], "usd");

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        const error = result.extract() as Error;
        expect(error.message).toBe("Failed to fetch counter values");
      }
    });

    it("should use different target currencies", async () => {
      const mockResponse = createMockResponse({
        ethereum: 2900.0,
      });

      vi.mocked(mockNetworkService.get).mockResolvedValue(Right(mockResponse));

      const result = await dataSource.getCounterValues(["ethereum"], "eur");

      expect(mockNetworkService.get).toHaveBeenCalledWith(
        `${mockCounterValueUrl}/v3/spot/simple?froms=ethereum&to=eur`,
      );

      expectSuccessfulResult(result, [{ ledgerId: "ethereum", rate: 2900.0 }]);
    });
  });
});
