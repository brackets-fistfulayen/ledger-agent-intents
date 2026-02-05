import { type Factory, inject, injectable } from "inversify";

import { loggerModuleTypes } from "../../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../../logger/service/LoggerPublisher.js";
import { STORAGE_KEYS } from "../../model/constant.js";
import { storageModuleTypes } from "../../storageModuleTypes.js";
import type { StorageService } from "../../StorageService.js";
import type { KeyPairMigrationService } from "./KeypairMigrationService.js";

@injectable()
export class MigrateDbUseCase {
  private logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    private readonly loggerFactory: Factory<LoggerPublisher>,
    @inject(storageModuleTypes.StorageService)
    private readonly storageService: StorageService,
    @inject(storageModuleTypes.KeyPairMigrationService)
    private readonly keyPairMigrationService: KeyPairMigrationService,
  ) {
    this.logger = this.loggerFactory("[MigrateDatabase Use Case]");
  }

  async execute(): Promise<void> {
    const startedVersion = await this.storageService.getDbVersion();
    let version = startedVersion;

    if (version === 0) {
      await this.migrateToV1();
      version = 1;
    }

    if (version === 1) {
      await this.migrateToV2();
      version = 2;
    }

    this.logger.info(
      `Database migrated from version ${startedVersion} to version ${version}`,
    );
  }

  /**
   * During the first iteration of the app, the keyPair wasn't encrypted.
   * After a dungeon review it was decided to encrypt the keyPair.
   */
  private async migrateToV1(): Promise<void> {
    const keyPairResult = await this.storageService.getKeyPair();

    await this.keyPairMigrationService.migrateKeyPairToEncrypted(keyPairResult);

    const setVersionResult = await this.storageService.setDbVersion(1);
    if (setVersionResult.isLeft()) {
      this.logger.error(
        "Failed to store DB version to already migrated database",
        {
          error: setVersionResult.extract(),
        },
      );
      throw new Error(
        "Failed to store DB version to already migrated database",
      );
    }
    this.logger.info("Database migrated to version 1");
  }

  /**
   * Migrates the database version storage from localStorage to IndexedDB.
   * This ensures the version is stored in a more persistent and reliable storage.
   */
  private async migrateToV2(): Promise<void> {
    const setVersionResult = await this.storageService.setDbVersion(2);

    if (setVersionResult.isLeft()) {
      this.logger.error("Failed to store DB version in IndexedDB", {
        error: setVersionResult.extract(),
      });
      throw new Error("Failed to migrate DB version to IndexedDB");
    }

    this.storageService.removeItem(STORAGE_KEYS.DB_VERSION);
    this.logger.info("Database migrated to version 2");
  }
}
