import { bufferToHexaString } from "@ledgerhq/device-management-kit";
import {
  Curve,
  KeyPair,
  NobleCryptoService,
} from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";
import { Left, Right } from "purify-ts";

import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { StorageIDBGetError } from "../../storage/model/errors.js";
import { StorageService } from "../../storage/StorageService.js";
import { DecryptKeyPairUseCase } from "./DecryptKeyPairUseCase.js";
import { EncryptKeyPairUseCase } from "./EncryptKeyPairUseCase.js";
import { GenerateKeyPairUseCase } from "./GenerateKeyPairUseCase.js";
import { GetEncryptionKeyUseCase } from "./GetEncryptionKey.js";
import { GetOrCreateKeyPairUseCase } from "./GetOrCreateKeyPairUseCase.js";

vi.mock("@ledgerhq/device-management-kit");
vi.mock("@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol");

describe("GetKeypairUseCase", () => {
  let useCase: GetOrCreateKeyPairUseCase;
  let mockLogger: LoggerPublisher;
  let mockStorageService: StorageService;
  let mockGenerateKeyPairUseCase: GenerateKeyPairUseCase;
  let mockGetEncryptionKeyUseCase: GetEncryptionKeyUseCase;
  let mockEncryptKeyPairUseCase: EncryptKeyPairUseCase;
  let mockDecryptKeyPairUseCase: DecryptKeyPairUseCase;
  let mockCryptoService: NobleCryptoService;
  let mockKeyPair: KeyPair;
  let mockEncryptionKey: CryptoKey;

  const mockEncryptedKeypair = new Uint8Array([1, 2, 3, 4, 5]);
  const mockDecryptedKeypair = new Uint8Array([6, 7, 8, 9, 10]);

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    } as unknown as LoggerPublisher;

    mockKeyPair = {
      id: "test-keypair-id",
      getPublicKeyToHex: vi.fn().mockReturnValue("mock-public-key"),
    } as unknown as KeyPair;

    mockEncryptionKey = { type: "secret" } as CryptoKey;

    mockStorageService = {
      getKeyPair: vi.fn(),
      storeKeyPair: vi.fn(),
    } as unknown as StorageService;

    mockGenerateKeyPairUseCase = {
      execute: vi.fn().mockResolvedValue(mockKeyPair),
    } as unknown as GenerateKeyPairUseCase;

    mockGetEncryptionKeyUseCase = {
      execute: vi.fn().mockResolvedValue(mockEncryptionKey),
    } as unknown as GetEncryptionKeyUseCase;

    mockEncryptKeyPairUseCase = {
      execute: vi.fn().mockResolvedValue(mockEncryptedKeypair),
    } as unknown as EncryptKeyPairUseCase;

    mockDecryptKeyPairUseCase = {
      execute: vi.fn().mockResolvedValue(mockDecryptedKeypair),
    } as unknown as DecryptKeyPairUseCase;

    mockCryptoService = {
      importKeyPair: vi.fn().mockReturnValue(mockKeyPair),
    } as unknown as NobleCryptoService;

    vi.mocked(NobleCryptoService).mockImplementation(() => mockCryptoService);
    vi.mocked(bufferToHexaString).mockReturnValue("hex-string");

    useCase = new GetOrCreateKeyPairUseCase(
      () => mockLogger,
      mockStorageService,
      mockGenerateKeyPairUseCase,
      mockGetEncryptionKeyUseCase,
      mockEncryptKeyPairUseCase,
      mockDecryptKeyPairUseCase,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    describe("when keyPair exists in storage", () => {
      beforeEach(() => {
        vi.mocked(mockStorageService.getKeyPair).mockResolvedValue(
          Right(mockEncryptedKeypair),
        );
      });

      it("should return the keyPair", async () => {
        const result = await useCase.execute();
        expect(result).toBe(mockKeyPair);
      });

      it("should call decrypt the keyPair", async () => {
        await useCase.execute();

        expect(mockStorageService.getKeyPair).toHaveBeenCalled();
        expect(mockGetEncryptionKeyUseCase.execute).toHaveBeenCalled();
        expect(mockDecryptKeyPairUseCase.execute).toHaveBeenCalledWith(
          mockEncryptedKeypair,
          mockEncryptionKey,
        );
        expect(mockCryptoService.importKeyPair).toHaveBeenCalledWith(
          mockDecryptedKeypair,
          Curve.K256,
        );
        expect(mockGenerateKeyPairUseCase.execute).not.toHaveBeenCalled();
        expect(mockEncryptKeyPairUseCase.execute).not.toHaveBeenCalled();
        expect(mockStorageService.storeKeyPair).not.toHaveBeenCalled();
      });
    });

    describe("when keyPair does not exist in storage", () => {
      beforeEach(() => {
        vi.mocked(mockStorageService.getKeyPair).mockResolvedValue(
          Left(new StorageIDBGetError("Keypair not found")),
        );
      });

      it("should return the keyPair", async () => {
        const result = await useCase.execute();
        expect(result).toBe(mockKeyPair);
      });

      it("should call generate a new keyPair and encrypt it", async () => {
        await useCase.execute();

        expect(mockStorageService.getKeyPair).toHaveBeenCalled();
        expect(mockGetEncryptionKeyUseCase.execute).toHaveBeenCalled();
        expect(mockDecryptKeyPairUseCase.execute).not.toHaveBeenCalled();
        expect(mockCryptoService.importKeyPair).not.toHaveBeenCalled();
        expect(mockGenerateKeyPairUseCase.execute).toHaveBeenCalled();
        expect(mockEncryptKeyPairUseCase.execute).toHaveBeenCalledWith(
          mockKeyPair,
          mockEncryptionKey,
        );
        expect(mockStorageService.storeKeyPair).toHaveBeenCalledWith(
          mockEncryptedKeypair,
        );
      });
    });
  });
});
