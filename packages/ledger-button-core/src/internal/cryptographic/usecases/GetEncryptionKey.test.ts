import { Just, Nothing } from "purify-ts";

import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { StorageService } from "../../storage/StorageService.js";
import { GetEncryptionKeyUseCase } from "./GetEncryptionKey.js";

const GENERATE_KEY_PARAMS = {
  algorithm: {
    name: "AES-GCM",
    length: 256,
  },
  extractable: false,
  keyUsages: ["encrypt", "decrypt"] as KeyUsage[],
};

describe("GetEncryptionKeyUseCase", () => {
  let useCase: GetEncryptionKeyUseCase;
  let mockLogger: LoggerPublisher;
  let mockStorageService: StorageService;
  let mockCryptoSubtle: SubtleCrypto;
  let mockEncryptionKey: CryptoKey;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    } as unknown as LoggerPublisher;

    mockEncryptionKey = { type: "secret" } as CryptoKey;

    mockStorageService = {
      getEncryptionKey: vi.fn(),
      storeEncryptionKey: vi.fn(),
    } as unknown as StorageService;

    mockCryptoSubtle = {
      generateKey: vi.fn().mockResolvedValue(mockEncryptionKey),
    } as unknown as SubtleCrypto;

    global.window = {
      crypto: {
        subtle: mockCryptoSubtle,
      },
    } as unknown as Window & typeof globalThis;

    useCase = new GetEncryptionKeyUseCase(
      () => mockLogger,
      mockStorageService,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("returns existing encryption key when found in storage", async () => {
      vi.mocked(mockStorageService.getEncryptionKey).mockResolvedValue(
        Just(mockEncryptionKey),
      );

      const result = await useCase.execute();

      expect(result).toBe(mockEncryptionKey);
      expect(mockStorageService.getEncryptionKey).toHaveBeenCalled();
      expect(mockCryptoSubtle.generateKey).not.toHaveBeenCalled();
      expect(mockStorageService.storeEncryptionKey).not.toHaveBeenCalled();
    });

    it("generates new key when encryption key is not found", async () => {
      vi.mocked(mockStorageService.getEncryptionKey).mockResolvedValue(
        Nothing,
      );

      const result = await useCase.execute();

      expect(result).toBe(mockEncryptionKey);
      expect(mockStorageService.getEncryptionKey).toHaveBeenCalled();
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        GENERATE_KEY_PARAMS.algorithm,
        GENERATE_KEY_PARAMS.extractable,
        GENERATE_KEY_PARAMS.keyUsages,
      );
      expect(mockStorageService.storeEncryptionKey).toHaveBeenCalledWith(
        mockEncryptionKey,
      );
    });

    it("generates new key when extracted encryption key is undefined", async () => {
      vi.mocked(mockStorageService.getEncryptionKey).mockResolvedValue(
        Just(undefined as unknown as CryptoKey),
      );

      const result = await useCase.execute();

      expect(result).toBe(mockEncryptionKey);
      expect(mockStorageService.getEncryptionKey).toHaveBeenCalled();
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        GENERATE_KEY_PARAMS.algorithm,
        GENERATE_KEY_PARAMS.extractable,
        GENERATE_KEY_PARAMS.keyUsages,
      );
      expect(mockStorageService.storeEncryptionKey).toHaveBeenCalledWith(
        mockEncryptionKey,
      );
    });
  });

  describe("storeEncryptionKey", () => {
    it("should store encryption key successfully", async () => {
      await expect(
        useCase.storeEncryptionKey(mockEncryptionKey),
      ).resolves.toBeUndefined();

      expect(mockStorageService.storeEncryptionKey).toHaveBeenCalledWith(
        mockEncryptionKey,
      );
    });

    it("should reject with error when storage fails", async () => {
      const error = new Error("Storage error");
      vi.mocked(mockStorageService.storeEncryptionKey).mockImplementation(
        () => {
          throw error;
        },
      );

      await expect(
        useCase.storeEncryptionKey(mockEncryptionKey),
      ).rejects.toThrow(error);
    });
  });

  describe("generateAndStoreEncryptionKey", () => {
    it("should generate and store new encryption key", async () => {
      const result = await useCase.generateAndStoreEncryptionKey();

      expect(result).toBe(mockEncryptionKey);
      expect(mockCryptoSubtle.generateKey).toHaveBeenCalledWith(
        GENERATE_KEY_PARAMS.algorithm,
        GENERATE_KEY_PARAMS.extractable,
        GENERATE_KEY_PARAMS.keyUsages,
      );
      expect(mockStorageService.storeEncryptionKey).toHaveBeenCalledWith(
        mockEncryptionKey,
      );
    });
  });
});
