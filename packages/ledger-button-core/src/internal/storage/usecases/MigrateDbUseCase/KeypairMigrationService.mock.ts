import type { KeyPair } from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";
import type { Factory } from "inversify";
import { Right } from "purify-ts";
import { vi } from "vitest";

import type { EncryptKeyPairUseCase } from "../../../cryptographic/usecases/EncryptKeyPairUseCase.js";
import type { GetEncryptionKeyUseCase } from "../../../cryptographic/usecases/GetEncryptionKey.js";
import type { GetOrCreateKeyPairUseCase } from "../../../cryptographic/usecases/GetOrCreateKeyPairUseCase.js";
import type { LoggerPublisher } from "../../../logger/service/LoggerPublisher.js";
import type { StorageService } from "../../StorageService.js";
import { KeyPairMigrationService } from "./KeypairMigrationService.js";

export const mockKeyPairBuffer = new Uint8Array([1, 2, 3, 4, 5]);
export const mockEncryptedKeyPair = new Uint8Array([6, 7, 8, 9, 10]);

export const createMockKeyPair = (): KeyPair =>
  ({
    id: "mock-keypair-id",
    getPublicKeyToHex: vi.fn().mockReturnValue("mock-public-key-hex"),
  }) as unknown as KeyPair;

export const createMockLogger = () => ({
  info: vi.fn(),
  error: vi.fn(),
});

export const createMockLoggerFactory = (
  mockLogger: ReturnType<typeof createMockLogger>,
): Factory<LoggerPublisher> => {
  return vi
    .fn()
    .mockReturnValue(mockLogger) as unknown as Factory<LoggerPublisher>;
};

export const createMockStorageService = () => ({
  removeKeyPair: vi.fn().mockResolvedValue(Right(true)),
  storeKeyPair: vi.fn().mockResolvedValue(Right(true)),
});

export const createMockEncryptKeyPairUseCase = () => ({
  execute: vi.fn().mockResolvedValue(mockEncryptedKeyPair),
});

export const createMockGetEncryptionKeyUseCase = () => ({
  execute: vi.fn().mockResolvedValue({} as CryptoKey),
});

export const createMockGetKeyPairUseCase = () => ({
  execute: vi.fn().mockResolvedValue(undefined),
});

export const createKeyPairMigrationService = (
  mockLoggerFactory: ReturnType<typeof createMockLoggerFactory>,
  mockStorageService: ReturnType<typeof createMockStorageService>,
  mockEncryptKeyPairUseCase: ReturnType<typeof createMockEncryptKeyPairUseCase>,
  mockGetEncryptionKeyUseCase: ReturnType<
    typeof createMockGetEncryptionKeyUseCase
  >,
  mockGetKeyPairUseCase: ReturnType<typeof createMockGetKeyPairUseCase>,
) => {
  return new KeyPairMigrationService(
    mockLoggerFactory,
    mockStorageService as unknown as StorageService,
    mockEncryptKeyPairUseCase as unknown as EncryptKeyPairUseCase,
    mockGetEncryptionKeyUseCase as unknown as GetEncryptionKeyUseCase,
    mockGetKeyPairUseCase as unknown as GetOrCreateKeyPairUseCase,
  );
};
