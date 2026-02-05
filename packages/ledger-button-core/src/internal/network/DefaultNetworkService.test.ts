import { NetworkError } from "../../api/errors/NetworkErrors.js";
import { Config } from "../config/model/config.js";
import { DefaultNetworkService } from "./DefaultNetworkService.js";

describe("DefaultNetworkService", () => {
  let networkService: DefaultNetworkService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-24T16:05:37.110Z"));
    networkService = new DefaultNetworkService(
      new Config({
        originToken: "test-origin-token",
        dAppIdentifier: "test-dapp-identifier",
        logLevel: "info",
        environment: "staging",
      }),
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("get", () => {
    it("should have the correct headers", async () => {
      const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      await networkService.get("https://whatever.com/ap1/posts/1", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(spy.mock.calls[0][0]).toBe("https://whatever.com/ap1/posts/1");
      expect(spy.mock.calls[0][1]).toMatchObject({
        headers: {
          // "X-Ledger-Client-Version": "test-dapp-identifier",
          "X-Ledger-Origin-Token": "test-origin-token",
          "Content-Type": "application/json",
        },
        method: "GET",
      });
    });

    it("should be able to get a resource", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
          title:
            "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        }),
      } as unknown as Response);

      const res = await networkService.get("https://whatever.com/ap1/posts/1");
      expect(res.isRight()).toBe(true);
      expect(res.extract()).toEqual({
        id: 1,
        title:
          "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      });
    });

    it("should be able to get a resource and return an error (response error)", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

      const res = await networkService.get("https://whatever.com/ap1/posts/1");

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(new Error("Network error"));
    });

    it("should be able to get a resource and return an error (res.ok = false)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      const res = await networkService.get("https://whatever.com/ap1/posts/1");

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(
        new NetworkError("GET request failed", {
          status: 404,
          url: "https://whatever.com/ap1/posts/1",
          options: undefined,
        }),
      );
    });
  });

  describe("post", () => {
    it("should have the correct headers", async () => {
      const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      await networkService.post(
        "https://whatever.com/ap1/posts",
        {
          id: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(spy.mock.calls[0][0]).toBe("https://whatever.com/ap1/posts");
      expect(spy.mock.calls[0][1]).toMatchObject({
        headers: {
          // "X-Ledger-Client-Version": "test-dapp-identifier",
          "X-Ledger-Origin-Token": "test-origin-token",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: {
          id: 1,
        },
      });
    });

    it("should be able to post a resource", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      const res = await networkService.post("https://whatever.com/ap1/posts", {
        id: 1,
      });

      expect(res.isRight()).toBe(true);
      expect(res.extract()).toEqual({
        id: 1,
      });
    });

    it("should be able to post a resource and return an error (response error)", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

      const res = await networkService.post("https://whatever.com/ap1/posts", {
        id: 1,
      });

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(new Error("Network error"));
    });

    it("should be able to post a resource and return an error (res.ok = false)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      const res = await networkService.post("https://whatever.com/ap1/posts", {
        id: 1,
      });

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(
        new NetworkError("POST request failed", {
          status: 404,
          url: "https://whatever.com/ap1/posts",
          options: undefined,
          body: { id: 1 },
        }),
      );
    });
  });

  describe("put", () => {
    it("should have the correct headers", async () => {
      const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      await networkService.put(
        "https://whatever.com/ap1/posts/1",
        {
          id: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(spy.mock.calls[0][0]).toBe("https://whatever.com/ap1/posts/1");
      expect(spy.mock.calls[0][1]).toMatchObject({
        headers: {
          // "X-Ledger-Client-Version": "test-dapp-identifier",
          "X-Ledger-Origin-Token": "test-origin-token",
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: {
          id: 1,
        },
      });
    });

    it("should be able to put a resource", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      const res = await networkService.put("https://whatever.com/ap1/posts/1", {
        id: 1,
      });

      expect(res.isRight()).toBe(true);
      expect(res.extract()).toEqual({
        id: 1,
      });
    });

    it("should be able to put a resource and return an error (response error)", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

      const res = await networkService.put("https://whatever.com/ap1/posts/1", {
        id: 1,
      });

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(new Error("Network error"));
    });

    it("should be able to put a resource and return an error (res.ok = false)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      const res = await networkService.put("https://whatever.com/ap1/posts/1", {
        id: 1,
      });

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(
        new NetworkError("PUT request failed", {
          status: 404,
          url: "https://whatever.com/ap1/posts/1",
          options: undefined,
          body: { id: 1 },
        }),
      );
    });
  });

  describe("patch", () => {
    it("should have the correct headers", async () => {
      const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      await networkService.patch(
        "https://whatever.com/ap1/posts/1",
        {
          id: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect(spy.mock.calls[0][0]).toBe("https://whatever.com/ap1/posts/1");
      expect(spy.mock.calls[0][1]).toMatchObject({
        headers: {
          // "X-Ledger-Client-Version": "test-dapp-identifier",
          "X-Ledger-Origin-Token": "test-origin-token",
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: {
          id: 1,
        },
      });
    });

    it("should be able to patch a resource", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      const res = await networkService.patch(
        "https://whatever.com/ap1/posts/1",
        {
          id: 1,
        },
      );

      expect(res.isRight()).toBe(true);
      expect(res.extract()).toEqual({
        id: 1,
      });
    });

    it("should be able to patch a resource and return an error (response error)", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

      const res = await networkService.patch(
        "https://whatever.com/ap1/posts/1",
        {
          id: 1,
        },
      );

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(new Error("Network error"));
    });

    it("should be able to patch a resource and return an error (res.ok = false)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      const res = await networkService.patch(
        "https://whatever.com/ap1/posts/1",
        {
          id: 1,
        },
      );

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(
        new NetworkError("PATCH request failed", {
          status: 404,
          url: "https://whatever.com/ap1/posts/1",
          options: undefined,
          body: { id: 1 },
        }),
      );
    });
  });

  describe("delete", () => {
    it("should call fetch with the correct headers", async () => {
      const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      await networkService.delete("https://whatever.com/ap1/posts/1", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(spy.mock.calls[0][0]).toBe("https://whatever.com/ap1/posts/1");
      expect(spy.mock.calls[0][1]).toMatchObject({
        headers: {
          //          "X-Ledger-Client-Version":
          //            "ledger-button/1.0.0-test.6/test-dapp-identifier",
          "X-Ledger-Origin-Token": "test-origin-token",
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
    });

    it("should be able to delete a resource", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 1,
        }),
      } as unknown as Response);

      const res = await networkService.delete(
        "https://whatever.com/ap1/posts/1",
      );

      expect(res.isRight()).toBe(true);
      expect(res.extract()).toEqual({
        id: 1,
      });
    });

    it("should be able to delete a resource and return an error (response error)", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

      const res = await networkService.delete(
        "https://whatever.com/ap1/posts/1",
      );

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(new Error("Network error"));
    });

    it("should be able to delete a resource and return an error (res.ok = false)", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      const res = await networkService.delete(
        "https://whatever.com/ap1/posts/1",
      );

      expect(res.isLeft()).toBe(true);
      expect(res.extract()).toEqual(
        new NetworkError("DELETE request failed", {
          status: 404,
          url: "https://whatever.com/ap1/posts/1",
          options: undefined,
        }),
      );
    });
  });
});
