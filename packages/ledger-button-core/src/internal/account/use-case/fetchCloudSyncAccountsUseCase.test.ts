import { of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CloudSyncService } from "../../cloudsync/service/CloudSyncService.js";
import { LedgerSyncAuthContextMissingError } from "../../ledgersync/model/errors.js";
import type { LedgerSyncService } from "../../ledgersync/service/LedgerSyncService.js";
import type { CloudSyncData } from "../service/AccountService.js";
import { FetchCloudSyncAccountsUseCase } from "./fetchCloudSyncAccountsUseCase.js";

function createMockLogger() {
  return {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    fatal: vi.fn(),
    subscribers: [],
  };
}

function createMockLoggerFactory() {
  return vi.fn().mockReturnValue(createMockLogger());
}

function createMockLedgerSyncService(): {
  authContext: LedgerSyncService["authContext"];
  authenticate: ReturnType<typeof vi.fn>;
  decrypt: ReturnType<typeof vi.fn>;
} {
  return {
    authContext: undefined,
    authenticate: vi.fn(),
    decrypt: vi.fn(),
  };
}

function createMockCloudSyncService(): {
  fetchEncryptedAccounts: ReturnType<typeof vi.fn>;
} {
  return {
    fetchEncryptedAccounts: vi.fn(),
  };
}

describe("FetchCloudSyncAccountsUseCase", () => {
  let fetchCloudSyncAccountsUseCase: FetchCloudSyncAccountsUseCase;
  let mockLedgerSyncService: ReturnType<typeof createMockLedgerSyncService>;
  let mockCloudSyncService: ReturnType<typeof createMockCloudSyncService>;

  beforeEach(() => {
    mockLedgerSyncService = createMockLedgerSyncService();
    mockCloudSyncService = createMockCloudSyncService();

    fetchCloudSyncAccountsUseCase = new FetchCloudSyncAccountsUseCase(
      createMockLoggerFactory(),
      mockLedgerSyncService as unknown as LedgerSyncService,
      mockCloudSyncService as unknown as CloudSyncService,
    );

    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should throw LedgerSyncAuthContextMissingError when auth context is missing", async () => {
      mockLedgerSyncService.authContext = undefined;

      await expect(fetchCloudSyncAccountsUseCase.execute()).rejects.toThrow(
        LedgerSyncAuthContextMissingError,
      );
    });

    it("should return parsed accounts when auth context is present", async () => {
      const mockAuthContext = {
        jwt: "mock-jwt",
        pubKey: "mock-pub-key",
      };

      const mockCloudSyncData: CloudSyncData = {
        accounts: [
          {
            id: "account-1",
            currencyId: "ethereum",
            freshAddress: "0x123",
            seedIdentifier: "seed-1",
            derivationMode: "default",
            index: 0,
          },
        ],
        accountNames: {
          "account-1": "My Account",
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockLedgerSyncService.authContext = mockAuthContext as any;
      mockLedgerSyncService.authenticate.mockReturnValue(of({}));

      const encodedData = btoa(JSON.stringify(mockCloudSyncData));
      mockCloudSyncService.fetchEncryptedAccounts.mockResolvedValue({
        payload: encodedData,
      });
      mockLedgerSyncService.decrypt.mockResolvedValue(
        new TextEncoder().encode(JSON.stringify(mockCloudSyncData)),
      );

      const result = await fetchCloudSyncAccountsUseCase.execute();

      expect(result).toEqual(mockCloudSyncData);
    });
  });
});
