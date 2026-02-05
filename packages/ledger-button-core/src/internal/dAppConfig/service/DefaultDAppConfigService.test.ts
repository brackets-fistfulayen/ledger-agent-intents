import { Left, Right } from "purify-ts";

import type { BackendService } from "../../backend/BackendService.js";
import type { Config } from "../../config/model/config.js";
import type { DAppConfig } from "../dAppConfigTypes.js";
import { DefaultDAppConfigService } from "./DefaultDAppConfigService.js";

describe("DefaultDAppConfigService", () => {
  let dAppConfigService: DefaultDAppConfigService;
  let mockConfig: Config;
  let mockBackendService: BackendService;

  const mockDAppConfig: DAppConfig = {
    supportedBlockchains: [
      {
        id: "ethereum-1",
        currency_id: "ethereum",
        currency_name: "Ethereum",
        currency_ticker: "ETH",
      },
      {
        id: "polygon-2",
        currency_id: "polygon",
        currency_name: "Polygon",
        currency_ticker: "MATIC",
      },
    ],
    referralUrl: "https://example.com/referral",
    domainUrl: "https://example.com",
    appDependencies: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = {
      dAppIdentifier: "test-dapp-id",
      originToken: "test-origin-token",
    } as Config;

    mockBackendService = {
      getConfig: vi.fn(),
      broadcast: vi.fn(),
      event: vi.fn(),
    } as unknown as BackendService;

    dAppConfigService = new DefaultDAppConfigService(
      mockConfig,
      mockBackendService,
    );
  });

  describe("getDAppConfig", () => {
    it("should fetch and return DApp config on first call", async () => {
      vi.spyOn(mockBackendService, "getConfig").mockResolvedValue(
        Right(mockDAppConfig),
      );

      const result = await dAppConfigService.getDAppConfig();

      expect(result).toEqual(mockDAppConfig);
      expect(mockBackendService.getConfig).toHaveBeenCalledTimes(1);
      expect(mockBackendService.getConfig).toHaveBeenCalledWith({
        dAppIdentifier: "test-dapp-id",
      });
    });

    it("should cache config and not call backend on subsequent calls", async () => {
      vi.spyOn(mockBackendService, "getConfig").mockResolvedValue(
        Right(mockDAppConfig),
      );

      const result1 = await dAppConfigService.getDAppConfig();
      expect(result1).toEqual(mockDAppConfig);
      expect(mockBackendService.getConfig).toHaveBeenCalledTimes(1);

      const result2 = await dAppConfigService.getDAppConfig();
      expect(result2).toEqual(mockDAppConfig);
      expect(mockBackendService.getConfig).toHaveBeenCalledTimes(1);
    });

    it("should throw error when backend service returns Left", async () => {
      const backendError = new Error("Backend service unavailable");
      vi.spyOn(mockBackendService, "getConfig").mockResolvedValue(
        Left(backendError),
      );

      await expect(dAppConfigService.getDAppConfig()).rejects.toThrow(
        "Failed to get DApp config",
      );
      expect(mockBackendService.getConfig).toHaveBeenCalledTimes(1);
    });
  });
});
