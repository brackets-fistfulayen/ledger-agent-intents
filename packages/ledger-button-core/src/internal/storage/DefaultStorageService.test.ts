import "fake-indexeddb/auto";

import { Either, Just, Maybe, Nothing, Right } from "purify-ts";

import { STORAGE_KEYS } from "./model/constant.js";
import { type UserConsent } from "./model/UserConsent.js";
import { type IndexedDbService } from "./service/IndexedDbService.js";
import { type Account } from "../account/service/AccountService.js";
import { Config } from "../config/model/config.js";
import { ConsoleLoggerSubscriber } from "../logger/service/ConsoleLoggerSubscriber.js";
import { DefaultLoggerPublisher } from "../logger/service/DefaultLoggerPublisher.js";
import { DefaultStorageService } from "./DefaultStorageService.js";

vi.mock("../logger/service/DefaultLoggerPublisher.js");
vi.mock("../logger/service/ConsoleLoggerSubscriber.js");

let config: Config;
let storageService: DefaultStorageService;
let mockIndexedDbService: IndexedDbService;

describe("DefaultStorageService", () => {
  let mockStorage: { userConsent?: UserConsent; welcomeScreen?: boolean };

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    mockStorage = {};

    config = new Config({
      originToken: "test-token",
      dAppIdentifier: "test-app",
      logLevel: "info",
    });

    mockIndexedDbService = {
      initIdb: vi.fn(),
      storeKeyPair: vi.fn(),
      getKeyPair: vi.fn(),
      removeKeyPair: vi.fn(),
      storeEncryptionKey: vi.fn(),
      getEncryptionKey: vi.fn(),
      setDbVersion: vi.fn(),
      getDbVersion: vi.fn(),
      storeUserConsent: vi.fn().mockImplementation(async (consent) => {
        mockStorage.userConsent = consent;
        return Right(undefined);
      }),
      getUserConsent: vi.fn().mockImplementation(async () => {
        return Right(
          mockStorage.userConsent ? Just(mockStorage.userConsent) : Nothing,
        );
      }),
      storeWelcomeScreenCompleted: vi
        .fn()
        .mockImplementation(async (completed) => {
          mockStorage.welcomeScreen = completed;
          return Right(undefined);
        }),
      getWelcomeScreenCompleted: vi.fn().mockImplementation(async () => {
        return Right(
          mockStorage.welcomeScreen !== undefined
            ? Just(mockStorage.welcomeScreen)
            : Nothing,
        );
      }),
    } as unknown as IndexedDbService;

    storageService = new DefaultStorageService(
      (tag) =>
        new DefaultLoggerPublisher([new ConsoleLoggerSubscriber(config)], tag),
      mockIndexedDbService,
    );
  });

  describe("LocalStorage methods", () => {
    describe("saveItem", () => {
      it("should be able to save an item", () => {
        const spy = vi.spyOn(Storage.prototype, "setItem");
        storageService.saveItem("test", "test");
        expect(spy).toHaveBeenCalledWith(
          `${STORAGE_KEYS.PREFIX}-test`,
          JSON.stringify("test"),
        );
      });

      it("should be able to save an item with an object and sanitize it", () => {
        const spy = vi.spyOn(JSON, "stringify");

        storageService.saveItem("test", { test: "test" });
        expect(spy).toHaveBeenCalledWith({ test: "test" });
      });
    });

    describe("getItem", () => {
      it("should be able to get an item", () => {
        const spy = vi.spyOn(Storage.prototype, "getItem");
        storageService.saveItem("test", "test");
        const item = storageService.getItem("test");
        expect(item).toStrictEqual(Maybe.of("test"));
        expect(spy).toHaveBeenCalledWith(`${STORAGE_KEYS.PREFIX}-test`);
      });

      it("should be able to get an item with a Nothing if the key does not exist", () => {
        vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
        const item = storageService.getItem("test");
        expect(item).toStrictEqual(Nothing);
      });
    });

    describe("removeItem", () => {
      it("should be able to remove an item", () => {
        const spy = vi.spyOn(Storage.prototype, "removeItem");
        vi.spyOn(storageService, "hasItem").mockReturnValue(true);
        storageService.removeItem("test");
        expect(spy).toHaveBeenCalledWith(`${STORAGE_KEYS.PREFIX}-test`);
      });

      it("should not be able to remove an item if it does not exist", () => {
        const spy = vi.spyOn(Storage.prototype, "removeItem");
        vi.spyOn(storageService, "hasItem").mockReturnValue(false);
        storageService.removeItem("test");
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe("hasItem", () => {
      it("should be able to check if an item exists (false)", () => {
        const res = storageService.hasItem("test");
        expect(res).toBe(false);
      });

      it("should be able to check if an item exists (true)", () => {
        storageService.saveItem("key", "value");
        const res = storageService.hasItem("key");
        expect(res).toBe(true);
      });
    });

    describe("resetStorage", () => {
      it("should be able to reset the storage", () => {
        storageService.saveItem("test", "test");
        storageService.resetStorage();
        expect(localStorage.length).toBe(0);
      });

      it("should be able to reset the storage and keep other keys", () => {
        localStorage.setItem("yolo", "yolo");
        expect(localStorage.getItem("yolo")).toBe("yolo");
        storageService.saveItem("test", "test");
        storageService.resetStorage();
        expect(localStorage.getItem("ledger-button-test")).toBeNull();
      });
    });

    it("should be able to format the key", () => {
      const formattedKey = DefaultStorageService.formatKey("test");
      expect(formattedKey).toBe("ledger-button-test");
    });
  });

  describe("IndexedDB (KeyPair) methods", () => {
    describe.each([
      {
        methodName: "storeKeyPair",
        indexedDbMethod: "storeKeyPair",
        args: [new Uint8Array([1, 2, 3, 4, 5])],
        mockReturn: Right(true),
      },
      {
        methodName: "getKeyPair",
        indexedDbMethod: "getKeyPair",
        args: [],
        mockReturn: Right(new Uint8Array([1, 2, 3, 4, 5])),
      },
      {
        methodName: "removeKeyPair",
        indexedDbMethod: "removeKeyPair",
        args: [],
        mockReturn: Right(true),
      },
    ])(
      "$methodName delegates to IndexedDbService",
      ({ methodName, indexedDbMethod, args, mockReturn }) => {
        beforeEach(() => {
          vi.mocked(
            mockIndexedDbService[
              indexedDbMethod as keyof IndexedDbService
            ] as () => Promise<Either<unknown, unknown>>,
          ).mockResolvedValue(mockReturn);
        });

        it(`should call indexedDbService.${indexedDbMethod}`, async () => {
          await (
            storageService[methodName as keyof DefaultStorageService] as (
              ...args: unknown[]
            ) => Promise<unknown>
          )(...args);

          expect(
            mockIndexedDbService[indexedDbMethod as keyof IndexedDbService],
          ).toHaveBeenCalledWith(...args);
        });
      },
    );

    describe("storeEncryptionKey", () => {
      it("should call indexedDbService.storeEncryptionKey", async () => {
        const mockEncryptionKey = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"],
        );

        vi.mocked(mockIndexedDbService.storeEncryptionKey).mockResolvedValue();

        await storageService.storeEncryptionKey(mockEncryptionKey);

        expect(mockIndexedDbService.storeEncryptionKey).toHaveBeenCalledWith(
          mockEncryptionKey,
        );
      });
    });

    describe("getEncryptionKey", () => {
      it("should call indexedDbService.getEncryptionKey", async () => {
        const mockEncryptionKey = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"],
        );

        vi.mocked(mockIndexedDbService.getEncryptionKey).mockResolvedValue(
          Just(mockEncryptionKey),
        );

        const result = await storageService.getEncryptionKey();

        expect(mockIndexedDbService.getEncryptionKey).toHaveBeenCalled();
        expect(result).toEqual(Just(mockEncryptionKey));
      });

      it("should return Nothing when indexedDbService returns Nothing", async () => {
        vi.mocked(mockIndexedDbService.getEncryptionKey).mockResolvedValue(
          Nothing,
        );

        const result = await storageService.getEncryptionKey();

        expect(mockIndexedDbService.getEncryptionKey).toHaveBeenCalled();
        expect(result).toEqual(Nothing);
      });
    });
  });

  describe("Trust Chain ID methods", () => {
    describe("saveTrustChainId", () => {
      it("should be able to save and get a trust chain ID", () => {
        storageService.saveTrustChainId("test-trust-chain-id");
        expect(storageService.getTrustChainId()).toEqual(
          Maybe.of("test-trust-chain-id"),
        );
      });

      it("should be able to remove a trust chain ID", () => {
        storageService.saveTrustChainId("test-trust-chain-id");
        storageService.removeTrustChainId();
        expect(storageService.getTrustChainId()).toBe(Nothing);
      });

      it("should save trust chain validity timestamp", () => {
        const beforeSave = Date.now();
        storageService.saveTrustChainId("test-trust-chain-id");
        const afterSave = Date.now();

        const validity = storageService.getItem<number>(
          STORAGE_KEYS.TRUST_CHAIN_VALIDITY,
        );
        expect(validity.isJust()).toBe(true);
        validity.map((timestamp) => {
          expect(timestamp).toBeGreaterThanOrEqual(beforeSave);
          expect(timestamp).toBeLessThanOrEqual(afterSave);
        });
      });
    });

    describe("isTrustChainValid", () => {
      it("should return false when no trust chain validity is stored", () => {
        const isValid = storageService.isTrustChainValid();
        expect(isValid).toBe(false);
      });

      it("should return false when trust chain is expired", () => {
        const oldTimestamp = new Date();
        oldTimestamp.setDate(oldTimestamp.getDate() - 31);
        storageService.saveItem(
          STORAGE_KEYS.TRUST_CHAIN_VALIDITY,
          oldTimestamp.getTime(),
        );

        const isValid = storageService.isTrustChainValid();
        expect(isValid).toBe(false);
      });

      it("should return true when trust chain is still valid", () => {
        const recentTimestamp = new Date();
        recentTimestamp.setDate(recentTimestamp.getDate() - 15);
        storageService.saveItem(
          STORAGE_KEYS.TRUST_CHAIN_VALIDITY,
          recentTimestamp.getTime(),
        );

        const isValid = storageService.isTrustChainValid();
        expect(isValid).toBe(true);
      });

      it("should return false when trust chain is exactly 30 days old", () => {
        const exactTimestamp = new Date();
        exactTimestamp.setDate(exactTimestamp.getDate() - 30);
        storageService.saveItem(
          STORAGE_KEYS.TRUST_CHAIN_VALIDITY,
          exactTimestamp.getTime(),
        );

        const isValid = storageService.isTrustChainValid();
        expect(isValid).toBe(false);
      });
    });
  });

  describe("Selected Account methods", () => {
    describe("saveSelectedAccount", () => {
      it("should be able to save and get a selected account", () => {
        const mockAccount = {
          id: "test-account",
          name: "Test Account",
        } as Account;
        storageService.saveSelectedAccount(mockAccount);
        expect(storageService.getSelectedAccount()).toEqual(
          Maybe.of({
            id: "",
            name: "",
            currencyId: undefined,
            freshAddress: undefined,
            seedIdentifier: "",
            derivationMode: undefined,
            index: undefined,
            ticker: "",
            balance: "",
            tokens: [],
          }),
        );
      });

      it("should be able to remove a selected account", () => {
        const mockAccount = {
          id: "test-account",
          name: "Test Account",
        } as Account;
        storageService.saveSelectedAccount(mockAccount);
        storageService.removeSelectedAccount();
        expect(storageService.getSelectedAccount()).toBe(Nothing);
      });

      it("should handle complex account objects", () => {
        const complexAccount = {
          id: "complex-account",
          name: "Complex Account",
          currencyId: "BTC",
          freshAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          seedIdentifier: "seed123",
          derivationMode: "44'/0'/0'",
          index: 0,
          ticker: "BTC",
          balance: "0.0000",
          tokens: [],
        } as Account;

        storageService.saveSelectedAccount(complexAccount);
        const retrieved = storageService.getSelectedAccount();
        expect(retrieved).toEqual(
          Maybe.of({
            id: "",
            name: "",
            index: 0,
            balance: "",
            tokens: [],
            currencyId: "BTC",
            freshAddress: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            seedIdentifier: "",
            ticker: "",
            derivationMode: "44'/0'/0'",
          }),
        );
      });
    });
  });

  describe("User Consent methods", () => {
    describe("saveUserConsent", () => {
      it("should be able to save user consent", async () => {
        const consent = {
          consentGiven: true,
          consentDate: "2024-01-01T00:00:00.000Z",
        };
        await storageService.saveUserConsent(consent);
        expect(await storageService.getUserConsent()).toEqual(
          Maybe.of(consent),
        );
      });
    });

    describe("getUserConsent", () => {
      it("should return Nothing when no consent exists", async () => {
        expect(await storageService.getUserConsent()).toBe(Nothing);
      });

      it("should return consent when it exists", async () => {
        const consent = {
          consentGiven: false,
          consentDate: "2024-01-01T00:00:00.000Z",
        };
        await storageService.saveUserConsent(consent);
        expect(await storageService.getUserConsent()).toEqual(
          Maybe.of(consent),
        );
      });
    });

    describe("removeUserConsent", () => {
      it("should set consent to refused instead of removing", async () => {
        const consent = {
          consentGiven: true,
          consentDate: "2024-01-01T00:00:00.000Z",
        };
        await storageService.saveUserConsent(consent);
        await storageService.removeUserConsent();
        const result = await storageService.getUserConsent();
        expect(result.isJust()).toBe(true);
        expect(result.extract()?.consentGiven).toBe(false);
      });
    });
  });

  describe("Welcome Screen methods", () => {
    describe("saveWelcomeScreenCompleted", () => {
      it("should save welcome screen completed state", async () => {
        await storageService.saveWelcomeScreenCompleted();
        expect(await storageService.isWelcomeScreenCompleted()).toBe(true);
      });
    });

    describe("isWelcomeScreenCompleted", () => {
      it("should return false when welcome screen has not been completed", async () => {
        expect(await storageService.isWelcomeScreenCompleted()).toBe(false);
      });

      it("should return true when welcome screen has been completed", async () => {
        await storageService.saveWelcomeScreenCompleted();
        expect(await storageService.isWelcomeScreenCompleted()).toBe(true);
      });
    });

    describe("removeWelcomeScreenCompleted", () => {
      it("should set welcome screen to false instead of removing", async () => {
        await storageService.saveWelcomeScreenCompleted();
        await storageService.removeWelcomeScreenCompleted();
        expect(await storageService.isWelcomeScreenCompleted()).toBe(false);
      });
    });
  });

  describe("Error handling", () => {
    describe("getItem with invalid JSON", () => {
      it("should return Nothing when JSON parsing fails", () => {
        const invalidKey = DefaultStorageService.formatKey("invalid-json");
        localStorage.setItem(invalidKey, "invalid json content");

        const result = storageService.getItem("invalid-json");
        expect(result).toBe(Nothing);
      });
    });

    describe("removeItem return values", () => {
      it("should return true when item is successfully removed", () => {
        storageService.saveItem("test-remove", "value");
        const result = storageService.removeItem("test-remove");
        expect(result).toBe(true);
      });

      it("should return false when item does not exist", () => {
        const result = storageService.removeItem("non-existent");
        expect(result).toBe(false);
      });
    });
  });
});
