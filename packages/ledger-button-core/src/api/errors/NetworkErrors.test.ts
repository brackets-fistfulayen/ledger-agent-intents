import { LedgerButtonError } from "./LedgerButtonError.js";
import { BroadcastTransactionError, NetworkError } from "./NetworkErrors.js";

describe("NetworkErrors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("BroadcastTransactionError", () => {
    it("should be able to create a new error with error context", () => {
      const innerError = new Error("Transaction failed");
      const error = new BroadcastTransactionError(
        "Failed to broadcast transaction",
        { error: innerError },
      );

      expect(error).toBeDefined();
      expect(error.name).toBe("BroadcastTransactionError");
      expect(error.message).toBe("Failed to broadcast transaction");
      expect(error.context).toMatchObject({ error: innerError });
      expect(error.context?.error).toBe(innerError);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should preserve the original error details in context", () => {
      const innerError = new Error("Network timeout");
      innerError.stack = "Error: Network timeout\n    at test.js:1:1";
      const error = new BroadcastTransactionError("Broadcast failed", {
        error: innerError,
      });

      expect(error.context?.error.message).toBe("Network timeout");
      expect(error.context?.error.stack).toBeDefined();
    });

    it("should be able to serialize the error", () => {
      const innerError = new Error("RPC error");
      const error = new BroadcastTransactionError("test", {
        error: innerError,
      });
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "BroadcastTransactionError",
        message: "test",
        context: { error: innerError },
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });

  describe("NetworkError", () => {
    it("should be able to create a new error with required context", () => {
      const error = new NetworkError("Request failed", {
        status: 500,
        url: "https://api.example.com/data",
      });

      expect(error).toBeDefined();
      expect(error.name).toBe("NetworkError");
      expect(error.message).toBe("Request failed");
      expect(error.context).toMatchObject({
        status: 500,
        url: "https://api.example.com/data",
      });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });

    it("should be able to create error with optional options context", () => {
      const options = {
        method: "POST" as const,
        headers: { "Content-Type": "application/json" },
      };
      const error = new NetworkError("Request failed", {
        status: 404,
        url: "https://api.example.com/endpoint",
        options,
      });

      expect(error).toBeDefined();
      expect(error.context).toMatchObject({
        status: 404,
        url: "https://api.example.com/endpoint",
        options,
      });
      expect(error.context?.options).toBe(options);
    });

    it("should be able to create error with optional body context", () => {
      const body = { error: "Not found", code: 404 };
      const error = new NetworkError("Request failed", {
        status: 404,
        url: "https://api.example.com/endpoint",
        body,
      });

      expect(error).toBeDefined();
      expect(error.context).toMatchObject({
        status: 404,
        url: "https://api.example.com/endpoint",
        body,
      });
      expect(error.context?.body).toEqual(body);
    });

    it("should be able to create error with all context fields", () => {
      const options = {
        method: "PUT" as const,
        headers: { Authorization: "Bearer token" },
      };
      const body = { message: "Invalid request" };
      const error = new NetworkError("Request failed", {
        status: 400,
        url: "https://api.example.com/update",
        options,
        body,
      });

      expect(error).toBeDefined();
      expect(error.context).toMatchObject({
        status: 400,
        url: "https://api.example.com/update",
        options,
        body,
      });
    });

    it("should handle different HTTP status codes", () => {
      const error401 = new NetworkError("Unauthorized", {
        status: 401,
        url: "https://api.example.com/secure",
      });
      const error500 = new NetworkError("Server error", {
        status: 500,
        url: "https://api.example.com/data",
      });

      expect(error401.context?.status).toBe(401);
      expect(error500.context?.status).toBe(500);
    });

    it("should be able to serialize the error", () => {
      const options = { headers: { Accept: "application/json" } };
      const body = { error: "timeout" };
      const error = new NetworkError("test", {
        status: 503,
        url: "https://api.example.com/test",
        options,
        body,
      });
      const serialized = error.toJSON();

      expect(serialized).toMatchObject({
        name: "NetworkError",
        message: "test",
        context: {
          status: 503,
          url: "https://api.example.com/test",
          options,
          body,
        },
        timestamp: expect.any(Date),
        stack: expect.any(String),
      });
    });
  });
});
