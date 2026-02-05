import {
  bufferToHexaString,
  hexaStringToBuffer,
} from "@ledgerhq/device-management-kit";
import { KeyPair } from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";

import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { EncryptKeyPairUseCase } from "./EncryptKeyPairUseCase.js";

vi.mock("@ledgerhq/device-management-kit");

describe("EncryptKeyPairUseCase", () => {
  let useCase: EncryptKeyPairUseCase;
  let mockLogger: LoggerPublisher;
  let mockKeyPair: KeyPair;
  let mockEncryptionKey: CryptoKey;
  let mockCryptoSubtle: SubtleCrypto;

  const mockPrivateKeyHex = "0x1234567890abcdef";
  const mockPrivateKeyBytes = new Uint8Array([
    0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef,
  ]);
  const mockIv = new Uint8Array(12).fill(0x42);
  const mockCiphertext = new ArrayBuffer(16);

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    } as unknown as LoggerPublisher;

    mockKeyPair = {
      id: mockPrivateKeyHex,
      getPublicKeyToHex: vi.fn().mockReturnValue("mock-public-key"),
    } as unknown as KeyPair;

    mockEncryptionKey = {} as CryptoKey;

    mockCryptoSubtle = {
      encrypt: vi.fn().mockResolvedValue(mockCiphertext),
    } as unknown as SubtleCrypto;

    global.window = {
      crypto: {
        subtle: mockCryptoSubtle,
        getRandomValues: vi.fn().mockReturnValue(mockIv),
      },
    } as unknown as Window & typeof globalThis;

    vi.mocked(hexaStringToBuffer).mockReturnValue(mockPrivateKeyBytes);
    vi.mocked(bufferToHexaString).mockReturnValue("encrypted-hex");

    useCase = new EncryptKeyPairUseCase(() => mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should encrypt a keypair successfully", async () => {
      const result = await useCase.execute(mockKeyPair, mockEncryptionKey);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(mockIv.length + mockCiphertext.byteLength);
      expect(hexaStringToBuffer).toHaveBeenCalledWith(mockPrivateKeyHex);
      expect(window.crypto.getRandomValues).toHaveBeenCalled();
      expect(mockCryptoSubtle.encrypt).toHaveBeenCalledWith(
        {
          name: "AES-GCM",
          iv: mockIv,
        },
        mockEncryptionKey,
        mockPrivateKeyBytes,
      );
    });

    describe.each([
      {
        scenario: "window.crypto is undefined",
        setup: () => {
          global.window = {
            crypto: undefined,
          } as unknown as Window & typeof globalThis;
        },
        expectedError: "Web Crypto API is not available",
      },
      {
        scenario: "window.crypto.subtle is undefined",
        setup: () => {
          global.window = {
            crypto: { subtle: undefined },
          } as unknown as Window & typeof globalThis;
        },
        expectedError: "Web Crypto API is not available",
      },
      {
        scenario: "private key bytes are null",
        setup: () => {
          vi.mocked(hexaStringToBuffer).mockReturnValue(null);
        },
        expectedError: "Can't encrypt keyPair",
      },
    ])("should throw an error when $scenario", ({ setup, expectedError }) => {
      beforeEach(() => {
        setup();
      });

      it("should reject with expected error", async () => {
        await expect(
          useCase.execute(mockKeyPair, mockEncryptionKey),
        ).rejects.toThrow(expectedError);
      });
    });
  });
});
