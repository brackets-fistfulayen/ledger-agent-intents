import { Right } from "purify-ts";
import { vi } from "vitest";

import type { StorageService } from "../../StorageService.js";
import type { KeyPairMigrationService } from "./KeypairMigrationService.js";
import { MigrateDbUseCase } from "./MigrateDbUseCase.js";

export const mockKeyPairBuffer = new Uint8Array([1, 2, 3]);

export const createMockStorageService = () => ({
  getDbVersion: vi.fn(),
  setDbVersion: vi.fn().mockResolvedValue(Right(undefined)),
  removeItem: vi.fn(),
  getKeyPair: vi.fn().mockResolvedValue(Right(mockKeyPairBuffer)),
});

export const createMockLogger = () => ({
  info: vi.fn(),
});

export const createMockLoggerFactory = (
  mockLogger: ReturnType<typeof createMockLogger>,
) => vi.fn().mockReturnValue(mockLogger);

export const createMockKeyPairMigrationService = () => ({
  migrateKeyPairToEncrypted: vi.fn().mockResolvedValue(undefined),
});

export const createMigrateDbUseCase = (
  mockStorageService: ReturnType<typeof createMockStorageService>,
  mockLoggerFactory: ReturnType<typeof createMockLoggerFactory>,
  mockKeyPairMigrationService: ReturnType<
    typeof createMockKeyPairMigrationService
  >,
) => {
  return new MigrateDbUseCase(
    mockLoggerFactory,
    mockStorageService as unknown as StorageService,
    mockKeyPairMigrationService as unknown as KeyPairMigrationService,
  );
};
