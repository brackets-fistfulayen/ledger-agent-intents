import {
  Curve,
  NobleCryptoService,
} from "@ledgerhq/device-trusted-app-kit-ledger-keyring-protocol";
import { type Factory, inject, injectable } from "inversify";

import { cryptographicModuleTypes } from "../../../cryptographic/cryptographicModuleTypes.js";
import type { EncryptKeyPairUseCase } from "../../../cryptographic/usecases/EncryptKeyPairUseCase.js";
import type { GetEncryptionKeyUseCase } from "../../../cryptographic/usecases/GetEncryptionKey.js";
import type { GetOrCreateKeyPairUseCase } from "../../../cryptographic/usecases/GetOrCreateKeyPairUseCase.js";
import { loggerModuleTypes } from "../../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../../logger/service/LoggerPublisher.js";
import { storageModuleTypes } from "../../storageModuleTypes.js";
import type { StorageService } from "../../StorageService.js";

@injectable()
export class KeyPairMigrationService {
  private logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    private readonly loggerFactory: Factory<LoggerPublisher>,
    @inject(storageModuleTypes.StorageService)
    private readonly storageService: StorageService,
    @inject(cryptographicModuleTypes.EncryptKeyPairUseCase)
    private readonly encryptKeyPairUseCase: EncryptKeyPairUseCase,
    @inject(cryptographicModuleTypes.GetEncryptionKeyUseCase)
    private readonly getEncryptionKeyUseCase: GetEncryptionKeyUseCase,
    @inject(cryptographicModuleTypes.GetOrCreateKeyPairUseCase)
    private readonly getOrCreateKeyPairUseCase: GetOrCreateKeyPairUseCase,
  ) {
    this.logger = this.loggerFactory("[KeyPair Migration Service]");
  }

  async migrateKeyPairToEncrypted(
    keyPairResult: Awaited<ReturnType<StorageService["getKeyPair"]>>,
  ): Promise<void> {
    try {
      if (keyPairResult.isRight()) {
        const keyPairBuffer = keyPairResult.extract();

        await this.encryptExistingKeyPair(keyPairBuffer);
      } else {
        await this.getOrCreateKeyPairUseCase.execute();
      }
    } catch (error) {
      this.logger.error("Error migrating database to version 1", { error });
      await this.storageService.removeKeyPair();
      await this.getOrCreateKeyPairUseCase.execute();
    }
  }

  private async encryptExistingKeyPair(
    keyPairBuffer: Uint8Array,
  ): Promise<void> {
    this.logger.info("KeyPair found in storage, need to encrypt it");
    const cryptoService = new NobleCryptoService();
    const keyPair = cryptoService.importKeyPair(keyPairBuffer, Curve.K256);

    const encryptionKey = await this.getEncryptionKeyUseCase.execute();
    const encryptedKeyPair = await this.encryptKeyPairUseCase.execute(
      keyPair,
      encryptionKey,
    );

    await this.storageService.removeKeyPair();
    await this.storageService.storeKeyPair(encryptedKeyPair);
  }
}
