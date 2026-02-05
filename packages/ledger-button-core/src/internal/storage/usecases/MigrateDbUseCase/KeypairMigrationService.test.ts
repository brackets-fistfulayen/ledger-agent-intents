import {
  Curve,
  NobleCryptoService,
} from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";
import { Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createKeyPairMigrationService,
  createMockEncryptKeyPairUseCase,
  createMockGetEncryptionKeyUseCase,
  createMockGetKeyPairUseCase,
  createMockKeyPair,
  createMockLogger,
  createMockLoggerFactory,
  createMockStorageService,
  mockEncryptedKeyPair,
  mockKeyPairBuffer,
} from "./KeypairMigrationService.mock.js";

vi.mock("@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol", () => ({
  Curve: {
    K256: "K256",
  },
  NobleCryptoService: vi.fn(),
}));

describe("KeyPairMigrationService", () => {
  let keyPairMigrationService: ReturnType<typeof createKeyPairMigrationService>;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockLoggerFactory: ReturnType<typeof createMockLoggerFactory>;
  let mockStorageService: ReturnType<typeof createMockStorageService>;
  let mockEncryptKeyPairUseCase: ReturnType<
    typeof createMockEncryptKeyPairUseCase
  >;
  let mockGetEncryptionKeyUseCase: ReturnType<
    typeof createMockGetEncryptionKeyUseCase
  >;
  let mockGetKeyPairUseCase: ReturnType<typeof createMockGetKeyPairUseCase>;
  let mockCryptoService: {
    importKeyPair: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockLogger = createMockLogger();
    mockLoggerFactory = createMockLoggerFactory(mockLogger);
    mockStorageService = createMockStorageService();
    mockEncryptKeyPairUseCase = createMockEncryptKeyPairUseCase();
    mockGetEncryptionKeyUseCase = createMockGetEncryptionKeyUseCase();
    mockGetKeyPairUseCase = createMockGetKeyPairUseCase();

    mockCryptoService = {
      importKeyPair: vi.fn().mockReturnValue(createMockKeyPair()),
    };

    vi.mocked(NobleCryptoService).mockImplementation(() => {
      return mockCryptoService as unknown as NobleCryptoService;
    });

    keyPairMigrationService = createKeyPairMigrationService(
      mockLoggerFactory,
      mockStorageService,
      mockEncryptKeyPairUseCase,
      mockGetEncryptionKeyUseCase,
      mockGetKeyPairUseCase,
    );
  });

  describe("migrateKeyPairToEncrypted", () => {
    describe("when keyPair is found in storage", () => {
      it("should encrypt existing keyPair and store it in storage", async () => {
        const keyPairResult = Right(mockKeyPairBuffer);

        await keyPairMigrationService.migrateKeyPairToEncrypted(keyPairResult);

        expect(mockLogger.info).toHaveBeenCalledWith(
          "KeyPair found in storage, need to encrypt it",
        );
        expect(mockCryptoService.importKeyPair).toHaveBeenCalledWith(
          mockKeyPairBuffer,
          Curve.K256,
        );
        expect(mockGetEncryptionKeyUseCase.execute).toHaveBeenCalledTimes(1);
        expect(mockEncryptKeyPairUseCase.execute).toHaveBeenCalledTimes(1);
        expect(mockStorageService.removeKeyPair).toHaveBeenCalledTimes(1);
        expect(mockStorageService.storeKeyPair).toHaveBeenCalledWith(
          mockEncryptedKeyPair,
        );
      });
    });

    describe("when an error occurs", () => {
      it("should log error, remove keyPair and generate new keyPair", async () => {
        const keyPairResult = Right(mockKeyPairBuffer);
        const error = new Error("Encryption failed");
        mockEncryptKeyPairUseCase.execute.mockRejectedValue(error);

        await keyPairMigrationService.migrateKeyPairToEncrypted(keyPairResult);

        expect(mockLogger.error).toHaveBeenCalledWith(
          "Error migrating database to version 1",
          { error },
        );
        expect(mockStorageService.removeKeyPair).toHaveBeenCalledTimes(1);
        expect(mockGetKeyPairUseCase.execute).toHaveBeenCalledTimes(1);
      });
    });
  });
});
