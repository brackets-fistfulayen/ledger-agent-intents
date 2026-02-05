import { bufferToHexaString } from "@ledgerhq/device-management-kit";
import { type Factory, inject, injectable } from "inversify";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";

@injectable()
export class DecryptKeyPairUseCase {
  private logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    private readonly loggerFactory: Factory<LoggerPublisher>,
  ) {
    this.logger = this.loggerFactory("[Decrypt KeyPair Use Case]");
  }

  async execute(
    encryptedKeyPair: Uint8Array,
    decryptionKey: CryptoKey,
  ): Promise<Uint8Array> {
    this.logger.info("Decrypting keyPair with decryption key", {
      encryptedKeyPair: bufferToHexaString(encryptedKeyPair),
    });

    const iv = encryptedKeyPair.slice(0, 12);
    const ciphertext = encryptedKeyPair.slice(12);
    const decryptedKeyPair = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      decryptionKey,
      ciphertext,
    );

    return new Uint8Array(decryptedKeyPair);
  }
}
