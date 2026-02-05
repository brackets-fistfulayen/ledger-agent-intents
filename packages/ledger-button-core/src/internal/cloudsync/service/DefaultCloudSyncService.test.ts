import { Left, Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  FailedToFetchEncryptedAccountsError,
  NoAccountInSyncError,
} from "../../../api/errors/LedgerSyncErrors.js";
import type { Config } from "../../config/model/config.js";
import type { InternalAuthContext } from "../../ledgersync/model/InternalAuthContext.js";
import type { NetworkService } from "../../network/NetworkService.js";
import type { CloudSyncData } from "../model/cloudSyncTypes.js";
import { DefaultCloudSyncService } from "./DefaultCloudSyncService.js";

describe("DefaultCloudSyncService", () => {
  let cloudSyncService: DefaultCloudSyncService;
  let mockNetworkService: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockLogger: {
    log: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
  };
  let mockLoggerFactory: ReturnType<typeof vi.fn>;
  let mockConfig: {
    lkrp: {
      cloudSyncUrl: string;
    };
  };

  const mockAuthContext: InternalAuthContext = {
    jwt: {
      access_token: "test-access-token",
      permissions: {},
    },
    encryptionKey: new Uint8Array([1, 2, 3, 4, 5]),
    trustChainId: "test-trust-chain-id",
    applicationPath: "test-application-path",
    keyPair: new Uint8Array([6, 7, 8, 9, 10]),
  };

  beforeEach(() => {
    mockNetworkService = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    mockLogger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    mockLoggerFactory = vi.fn().mockReturnValue(mockLogger);

    mockConfig = {
      lkrp: {
        cloudSyncUrl: "https://test-cloud-sync-url.com",
      },
    };

    cloudSyncService = new DefaultCloudSyncService(
      mockLoggerFactory,
      mockNetworkService as NetworkService<RequestInit>,
      mockConfig as Config,
    );

    vi.clearAllMocks();
  });

  describe("fetchEncryptedAccounts", () => {
    const mockCloudSyncData: CloudSyncData = {
      version: 1,
      payload: "encrypted-payload-data",
      date: "2025-10-20T10:00:00Z",
      info: "test-info",
      status: "synced",
    };

    it("should fetch encrypted accounts with correct URL parameters", async () => {
      mockNetworkService.get.mockResolvedValueOnce(Right(mockCloudSyncData));

      await cloudSyncService.fetchEncryptedAccounts(mockAuthContext);

      expect(mockNetworkService.get).toHaveBeenCalledWith(
        "https://test-cloud-sync-url.com/atomic/v1/live?path=test-application-path&id=test-trust-chain-id&version=0",
        {
          headers: {
            Authorization: `Bearer ${mockAuthContext.jwt.access_token}`,
            "x-ledger-client-version": "ll-web-tools/0.0.0",
          },
        },
      );
    });

    it("should return cloud sync data when request is successful", async () => {
      mockNetworkService.get.mockResolvedValueOnce(Right(mockCloudSyncData));

      const result =
        await cloudSyncService.fetchEncryptedAccounts(mockAuthContext);

      expect(result).toEqual(mockCloudSyncData);
    });

    it("should throw NoAccountInSyncError when status is 'no-data'", async () => {
      const noDataResponse: CloudSyncData = {
        version: 0,
        payload: "",
        date: "2025-10-20T10:00:00Z",
        info: "",
        status: "no-data",
      };

      mockNetworkService.get.mockResolvedValue(Right(noDataResponse));

      await expect(
        cloudSyncService.fetchEncryptedAccounts(mockAuthContext),
      ).rejects.toThrow(NoAccountInSyncError);

      await expect(
        cloudSyncService.fetchEncryptedAccounts(mockAuthContext),
      ).rejects.toThrow("No data found");
    });

    it("should throw FailedToFetchEncryptedAccountsError when network request fails", async () => {
      const networkError = new Error("Network connection failed");
      mockNetworkService.get.mockResolvedValue(Left(networkError));

      await expect(
        cloudSyncService.fetchEncryptedAccounts(mockAuthContext),
      ).rejects.toThrow(FailedToFetchEncryptedAccountsError);

      await expect(
        cloudSyncService.fetchEncryptedAccounts(mockAuthContext),
      ).rejects.toThrow("Failed to fetch encrypted accounts");
    });

    it("should log error when network request fails", async () => {
      const networkError = new Error("Network connection failed");
      mockNetworkService.get.mockResolvedValueOnce(Left(networkError));

      try {
        await cloudSyncService.fetchEncryptedAccounts(mockAuthContext);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to fetch encrypted accounts",
        { error: networkError },
      );
    });

    it("should handle different auth contexts correctly", async () => {
      const differentAuthContext: InternalAuthContext = {
        jwt: {
          access_token: "different-token",
          permissions: {},
        },
        encryptionKey: new Uint8Array([11, 12, 13]),
        trustChainId: "different-trust-chain-id",
        applicationPath: "different-application-path",
        keyPair: new Uint8Array([14, 15, 16]),
      };

      mockNetworkService.get.mockResolvedValueOnce(Right(mockCloudSyncData));

      await cloudSyncService.fetchEncryptedAccounts(differentAuthContext);

      expect(mockNetworkService.get).toHaveBeenCalledWith(
        "https://test-cloud-sync-url.com/atomic/v1/live?path=different-application-path&id=different-trust-chain-id&version=0",
        {
          headers: {
            Authorization: "Bearer different-token",
            "x-ledger-client-version": "ll-web-tools/0.0.0",
          },
        },
      );
    });

    it("should handle special characters in URL parameters", async () => {
      const specialAuthContext: InternalAuthContext = {
        jwt: {
          access_token: "token-123",
          permissions: {},
        },
        encryptionKey: new Uint8Array([1, 2, 3]),
        trustChainId: "trust&chain=id",
        applicationPath: "path/with/slashes",
        keyPair: new Uint8Array([4, 5, 6]),
      };

      mockNetworkService.get.mockResolvedValueOnce(Right(mockCloudSyncData));

      await cloudSyncService.fetchEncryptedAccounts(specialAuthContext);

      const expectedUrl = new URL(
        "https://test-cloud-sync-url.com/atomic/v1/live",
      );
      expectedUrl.searchParams.set("path", "path/with/slashes");
      expectedUrl.searchParams.set("id", "trust&chain=id");
      expectedUrl.searchParams.set("version", "0");

      expect(mockNetworkService.get).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.any(Object),
      );
    });

    it("should use version 0 in URL parameters", async () => {
      mockNetworkService.get.mockResolvedValueOnce(Right(mockCloudSyncData));

      await cloudSyncService.fetchEncryptedAccounts(mockAuthContext);

      const callUrl = mockNetworkService.get.mock.calls[0][0] as string;
      expect(callUrl).toContain("version=0");
    });

    it("should include x-ledger-client-version header", async () => {
      mockNetworkService.get.mockResolvedValueOnce(Right(mockCloudSyncData));

      await cloudSyncService.fetchEncryptedAccounts(mockAuthContext);

      expect(mockNetworkService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-ledger-client-version": "ll-web-tools/0.0.0",
          }),
        }),
      );
    });

    it("should handle various error types from network service", async () => {
      const timeoutError = new Error("Request timeout");
      mockNetworkService.get.mockResolvedValueOnce(Left(timeoutError));

      await expect(
        cloudSyncService.fetchEncryptedAccounts(mockAuthContext),
      ).rejects.toThrow(FailedToFetchEncryptedAccountsError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to fetch encrypted accounts",
        { error: timeoutError },
      );
    });

    it("should handle concurrent requests independently", async () => {
      mockNetworkService.get
        .mockResolvedValueOnce(Right({ ...mockCloudSyncData, version: 1 }))
        .mockResolvedValueOnce(Right({ ...mockCloudSyncData, version: 2 }));

      const [result1, result2] = await Promise.all([
        cloudSyncService.fetchEncryptedAccounts(mockAuthContext),
        cloudSyncService.fetchEncryptedAccounts(mockAuthContext),
      ]);

      expect(result1.version).toBe(1);
      expect(result2.version).toBe(2);
      expect(mockNetworkService.get).toHaveBeenCalledTimes(2);
    });
  });
});
