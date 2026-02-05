import { LedgerButtonError } from "./LedgerButtonError.js";
import {
  FailedToFetchEncryptedAccountsError,
  NoAccountInSyncError,
  NoCompatibleAccountsError,
} from "./LedgerSyncErrors.js";

describe("LedgerSyncErrors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("NoCompatibleAccountsError", () => {
    it("should be able to create a new error with networks context", () => {
      const networks = ["ethereum", "polygon"];
      const error = new NoCompatibleAccountsError(
        "No compatible accounts found",
        { networks },
      );

      expect(error).toBeDefined();
      expect(error.name).toBe("NoCompatibleAccountsError");
      expect(error.message).toBe("No compatible accounts found");
      expect(error.context).toMatchObject({ networks });
      expect(error.context?.networks).toEqual(networks);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should be able to create error with default empty networks array", () => {
      const error = new NoCompatibleAccountsError("No accounts");

      expect(error).toBeDefined();
      expect(error.context).toMatchObject({ networks: [] });
      expect(error.context?.networks).toEqual([]);
    });

    it("should handle single network in array", () => {
      const networks = ["bitcoin"];
      const error = new NoCompatibleAccountsError("No accounts", {
        networks,
      });

      expect(error.context?.networks).toEqual(["bitcoin"]);
      expect(error.context?.networks).toHaveLength(1);
    });

    it("should handle multiple networks", () => {
      const networks = ["ethereum", "polygon", "arbitrum", "optimism"];
      const error = new NoCompatibleAccountsError("No compatible accounts", {
        networks,
      });

      expect(error.context?.networks).toEqual(networks);
      expect(error.context?.networks).toHaveLength(4);
    });

    it("should be able to serialize the error", () => {
      const networks = ["solana", "cardano"];
      const error = new NoCompatibleAccountsError("test", { networks });
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "NoCompatibleAccountsError",
        message: "test",
        context: { networks },
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });

  describe("NoAccountInSyncError", () => {
    it("should be able to create a new error without context", () => {
      const error = new NoAccountInSyncError("No account in sync");

      expect(error).toBeDefined();
      expect(error.name).toBe("NoAccountInSyncError");
      expect(error.message).toBe("No account in sync");
      expect(error.context).toBeUndefined();
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should be able to create error with context", () => {
      const context = { userId: "user-123", syncAttempts: 3 };
      const error = new NoAccountInSyncError("Sync failed", context);

      expect(error).toBeDefined();
      expect(error.context).toMatchObject(context);
      expect(error.context?.userId).toBe("user-123");
      expect(error.context?.syncAttempts).toBe(3);
    });

    it("should handle empty context object", () => {
      const error = new NoAccountInSyncError("No sync", {});

      expect(error).toBeDefined();
      expect(error.context).toMatchObject({});
    });

    it("should handle various context properties", () => {
      const context = {
        lastSyncTimestamp: new Date().toISOString(),
        network: "ethereum",
        deviceId: "device-456",
      };
      const error = new NoAccountInSyncError("Account sync error", context);

      expect(error.context).toMatchObject(context);
      expect(error.context?.lastSyncTimestamp).toBe(context.lastSyncTimestamp);
      expect(error.context?.network).toBe("ethereum");
      expect(error.context?.deviceId).toBe("device-456");
    });

    it("should be able to serialize the error", () => {
      const context = { reason: "connection_lost", retries: 5 };
      const error = new NoAccountInSyncError("test", context);
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "NoAccountInSyncError",
        message: "test",
        context,
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });

  describe("FailedToFetchEncryptedAccountsError", () => {
    it("should be able to create a new error without context", () => {
      const error = new FailedToFetchEncryptedAccountsError(
        "Failed to fetch encrypted accounts",
      );

      expect(error).toBeDefined();
      expect(error.name).toBe("FailedToFetchEncryptedAccountsError");
      expect(error.message).toBe("Failed to fetch encrypted accounts");
      expect(error.context).toBeUndefined();
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should be able to create error with context", () => {
      const context = { endpoint: "/api/accounts", statusCode: 500 };
      const error = new FailedToFetchEncryptedAccountsError(
        "Fetch failed",
        context,
      );

      expect(error).toBeDefined();
      expect(error.context).toMatchObject(context);
      expect(error.context?.endpoint).toBe("/api/accounts");
      expect(error.context?.statusCode).toBe(500);
    });

    it("should handle error context with nested error", () => {
      const innerError = new Error("Network timeout");
      const context = { error: innerError, url: "https://api.ledger.com" };
      const error = new FailedToFetchEncryptedAccountsError(
        "Encryption fetch error",
        context,
      );

      expect(error.context).toMatchObject(context);
      expect(error.context?.error).toBe(innerError);
      expect(error.context?.url).toBe("https://api.ledger.com");
    });

    it("should handle various context properties", () => {
      const context = {
        accountCount: 0,
        expectedCount: 5,
        apiVersion: "v2",
      };
      const error = new FailedToFetchEncryptedAccountsError(
        "Account mismatch",
        context,
      );

      expect(error.context).toMatchObject(context);
      expect(error.context?.accountCount).toBe(0);
      expect(error.context?.expectedCount).toBe(5);
      expect(error.context?.apiVersion).toBe("v2");
    });

    it("should be able to serialize the error", () => {
      const context = { reason: "unauthorized", statusCode: 401 };
      const error = new FailedToFetchEncryptedAccountsError("test", context);
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "FailedToFetchEncryptedAccountsError",
        message: "test",
        context,
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });
});
