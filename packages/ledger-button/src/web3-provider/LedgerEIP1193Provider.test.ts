/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CommonEIP1193ErrorCode,
  type LedgerButtonCore,
} from "@ledgerhq/ledger-wallet-provider-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LedgerButtonApp } from "../ledger-button-app.js";
import { LedgerEIP1193Provider } from "./LedgerEIP1193Provider.js";

const createMockLedgerButtonCore = (): LedgerButtonCore =>
  ({
    getSelectedAccount: vi.fn(),
    setChainId: vi.fn(),
    disconnect: vi.fn(),
    jsonRpcRequest: vi.fn(),
    observeContext: vi.fn(() => ({
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn(),
      })),
    })),
  }) as unknown as LedgerButtonCore;

const createMockLedgerButtonApp = (): LedgerButtonApp =>
  ({
    isModalOpen: false,
    navigationIntent: vi.fn(),
  }) as unknown as LedgerButtonApp;

describe("LedgerEIP1193Provider", () => {
  let provider: LedgerEIP1193Provider;
  let mockCore: ReturnType<typeof createMockLedgerButtonCore>;
  let mockApp: ReturnType<typeof createMockLedgerButtonApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock window object for Node.js environment (fresh mocks for each test)
    if (typeof window === "undefined") {
      Object.defineProperty(global, "window", {
        value: {
          addEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    } else {
      vi.spyOn(window, "addEventListener");
      vi.spyOn(window, "dispatchEvent");
    }

    mockCore = createMockLedgerButtonCore();
    mockApp = createMockLedgerButtonApp();

    provider = new LedgerEIP1193Provider(mockCore, mockApp);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with correct properties", () => {
      expect(provider.isLedgerButton).toBe(true);
      expect(provider.isConnected()).toBe(false);
    });

    it("should set up window event listeners", () => {
      vi.clearAllMocks();
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      new LedgerEIP1193Provider(mockCore, mockApp);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "ledger-provider-disconnect",
        expect.any(Function),
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "ledger-provider-close",
        expect.any(Function),
      );
    });
  });

  describe("on", () => {
    it("should add event listener", () => {
      const listener = vi.fn();

      provider.on("connect", listener);

      expect(provider["_listeners"].has(listener)).toBe(true);
    });

    it("should wrap listener to handle CustomEvent", () => {
      const listener = vi.fn();
      const mockEvent = new CustomEvent("connect", {
        detail: { chainId: "0x1" },
      });

      provider.on("connect", listener);
      provider.dispatchEvent(mockEvent);

      expect(listener).toHaveBeenCalledWith({ chainId: "0x1" });
    });

    it("should return provider instance for chaining", () => {
      const listener = vi.fn();

      const result = provider.on("connect", listener);

      expect(result).toBe(provider);
    });
  });

  describe("removeListener", () => {
    it("should remove event listener", () => {
      const listener = vi.fn();

      provider.on("connect", listener);
      expect(provider["_listeners"].has(listener)).toBe(true);

      provider.removeListener("connect", listener);
      expect(provider["_listeners"].has(listener)).toBe(false);
    });

    it("should return provider instance for chaining", () => {
      const listener = vi.fn();

      provider.on("connect", listener);
      const result = provider.removeListener("connect", listener);

      expect(result).toBe(provider);
    });

    it("should handle removing non-existent listener", () => {
      const listener = vi.fn();

      const result = provider.removeListener("connect", listener);

      expect(result).toBe(provider);
    });
  });

  describe("connect", () => {
    it("should set connected status to true", async () => {
      await provider.connect();

      expect(provider.isConnected()).toBe(true);
    });

    it("should dispatch connect event", async () => {
      const listener = vi.fn();

      provider.on("connect", listener);
      await provider.connect();

      expect(listener).toHaveBeenCalledWith({
        chainId: "0x1",
      });
    });

    it("should not connect multiple times", async () => {
      const listener = vi.fn();

      provider.on("connect", listener);
      await provider.connect();
      await provider.connect();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("request", () => {
    it("should return error when provider is busy", async () => {
      provider["_pendingPromise"] = {
        resolve: vi.fn(),
        reject: vi.fn(),
      };

      const result = await provider.request({
        method: "eth_accounts",
        params: [],
      });

      expect(result).toHaveProperty(
        "code",
        CommonEIP1193ErrorCode.InternalError,
      );
      expect(result).toHaveProperty("message", "Ledger Provider is busy");
    });

    it("should queue request when modal is open", async () => {
      (mockApp as any).isModalOpen = true;

      const requestPromise = provider.request({
        method: "eth_accounts",
        params: [],
      });

      expect(provider["_pendingRequest"]).toEqual({
        method: "eth_accounts",
        params: [],
      });
      expect(provider["_pendingPromise"]).toBeDefined();

      (mockApp as any).isModalOpen = false;
      vi.advanceTimersByTime(2000);

      await requestPromise;
    });

    it("should execute request immediately when modal is not open", async () => {
      mockCore.getSelectedAccount = vi.fn().mockReturnValue(null);

      const result = await provider.request({
        method: "eth_accounts",
        params: [],
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it("should handle unsupported method", async () => {
      const result = await provider.request({
        method: "unsupported_method" as any,
        params: [],
      });

      expect(result).toHaveProperty(
        "code",
        CommonEIP1193ErrorCode.UnsupportedMethod,
      );
    });
  });

  describe("disconnect", () => {
    it("should not disconnect when already disconnected", async () => {
      const disconnectSpy = vi.spyOn(mockCore, "disconnect");

      await provider.disconnect();

      expect(disconnectSpy).not.toHaveBeenCalled();
    });

    it("should disconnect when connected", async () => {
      await provider.connect();
      const disconnectSpy = vi.spyOn(mockCore, "disconnect");

      await provider.disconnect();

      expect(disconnectSpy).toHaveBeenCalled();
      expect(provider.isConnected()).toBe(false);
    });

    it("should dispatch disconnect event", async () => {
      await provider.connect();

      const listener = vi.fn();
      provider.on("disconnect", listener);

      await provider.disconnect();

      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0]).toHaveProperty("code", 1000);
      expect(listener.mock.calls[0][0]).toHaveProperty(
        "message",
        "Provider disconnected",
      );
    });

    it("should reject pending request on disconnect", async () => {
      await provider.connect();
      (mockApp as any).isModalOpen = true;

      const requestPromise = provider.request({
        method: "eth_accounts",
        params: [],
      });

      await provider.disconnect();

      await expect(requestPromise).rejects.toHaveProperty("code", 1000);
      await expect(requestPromise).rejects.toHaveProperty(
        "message",
        "Provider disconnected",
      );
    });

    it("should use custom disconnect code and message", async () => {
      await provider.connect();

      const listener = vi.fn();
      provider.on("disconnect", listener);

      await provider.disconnect(4001, "Custom disconnect message");

      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0]).toHaveProperty("code", 4001);
      expect(listener.mock.calls[0][0]).toHaveProperty(
        "message",
        "Custom disconnect message",
      );
    });
  });
});
