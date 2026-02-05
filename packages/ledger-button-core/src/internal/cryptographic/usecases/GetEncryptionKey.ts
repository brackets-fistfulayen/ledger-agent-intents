import { type Factory, inject } from "inversify";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { storageModuleTypes } from "../../storage/storageModuleTypes.js";
import type { StorageService } from "../../storage/StorageService.js";

export class GetEncryptionKeyUseCase {
  private logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    private readonly loggerFactory: Factory<LoggerPublisher>,
    @inject(storageModuleTypes.StorageService)
    private readonly storageService: StorageService,
  ) {
    this.logger = this.loggerFactory("[Get Encryption Key Use Case]");
  }

  async execute(): Promise<CryptoKey> {
    const encryptionKeyMaybe = await this.storageService.getEncryptionKey();
    if (encryptionKeyMaybe.isNothing()) {
      this.logger.debug("Encryption key not found, generating new one");
      return await this.generateAndStoreEncryptionKey();
    }

    const encryptionKey = encryptionKeyMaybe.extract();
    if (!encryptionKey) {
      this.logger.debug("Encryption key is undefined, generating new one");
      return await this.generateAndStoreEncryptionKey();
    }

    return encryptionKey;
  }

  async storeEncryptionKey(encryptionKey: CryptoKey): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.storageService.storeEncryptionKey(encryptionKey);
        resolve();
      } catch (error) {
        this.logger.error("Error storing encryption key", { error });
        reject(error);
      }
    });
  }

  async generateAndStoreEncryptionKey(): Promise<CryptoKey> {
    const encryptionKey = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"],
    );
    await this.storeEncryptionKey(encryptionKey);
    return encryptionKey;
  }
}
