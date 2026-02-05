import { Right } from "purify-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMigrateDbUseCase,
  createMockKeyPairMigrationService,
  createMockLogger,
  createMockLoggerFactory,
  createMockStorageService,
  mockKeyPairBuffer,
} from "./MigrateDbUseCase.mock.js";

describe("MigrateDbUseCase", () => {
  let migrateDbUseCase: ReturnType<typeof createMigrateDbUseCase>;
  let mockStorageService: ReturnType<typeof createMockStorageService>;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockLoggerFactory: ReturnType<typeof createMockLoggerFactory>;
  let mockKeyPairMigrationService: ReturnType<
    typeof createMockKeyPairMigrationService
  >;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStorageService = createMockStorageService();
    mockLogger = createMockLogger();
    mockLoggerFactory = createMockLoggerFactory(mockLogger);
    mockKeyPairMigrationService = createMockKeyPairMigrationService();

    migrateDbUseCase = createMigrateDbUseCase(
      mockStorageService,
      mockLoggerFactory,
      mockKeyPairMigrationService,
    );
  });

  describe("execute", () => {
    describe.each([
      {
        version: 0,
        migrationFunctionName: "migrateToV1" as const,
      },
      {
        version: 1,
        migrationFunctionName: "migrateToV2" as const,
      },
    ])(
      "should call ${migrationFunctionName} and migrate to version ${version + 1}",
      ({ version, migrationFunctionName }) => {
        let migrationSpy: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
          vi.clearAllMocks();

          migrationSpy = vi.spyOn(
            migrateDbUseCase,
            migrationFunctionName as never,
          );
        });

        it(`should call ${migrationFunctionName} and setDbVersion to ${version + 1}`, async () => {
          mockStorageService.getDbVersion.mockResolvedValue(version);

          await migrateDbUseCase.execute();

          expect(migrationSpy).toHaveBeenCalledTimes(1);
          expect(mockStorageService.setDbVersion).toHaveBeenCalledWith(
            version + 1,
          );
        });
      },
    );
  });

  describe("migrateToV1", () => {
    it("should call migrateKeyPairToEncrypted and setDbVersion to 1", async () => {
      mockStorageService.getKeyPair.mockResolvedValue(Right(mockKeyPairBuffer));

      await migrateDbUseCase["migrateToV1"]();

      expect(
        mockKeyPairMigrationService.migrateKeyPairToEncrypted,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockKeyPairMigrationService.migrateKeyPairToEncrypted,
      ).toHaveBeenCalledWith(Right(mockKeyPairBuffer));
      expect(mockStorageService.setDbVersion).toHaveBeenCalledWith(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database migrated to version 1",
      );
    });
  });

  describe("migrateToV2", () => {
    it("should call setDbVersion and removeItem from localStorage", async () => {
      await migrateDbUseCase["migrateToV2"]();

      expect(mockStorageService.setDbVersion).toHaveBeenCalledWith(2);
      expect(mockStorageService.removeItem).toHaveBeenCalledWith("dbVersion");
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Database migrated to version 2",
      );
    });
  });
});
