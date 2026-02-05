import { ContainerModule } from "inversify";

import { DecryptKeyPairUseCase } from "./usecases/DecryptKeyPairUseCase.js";
import { EncryptKeyPairUseCase } from "./usecases/EncryptKeyPairUseCase.js";
import { GenerateKeyPairUseCase } from "./usecases/GenerateKeyPairUseCase.js";
import { GetEncryptionKeyUseCase } from "./usecases/GetEncryptionKey.js";
import { GetOrCreateKeyPairUseCase } from "./usecases/GetOrCreateKeyPairUseCase.js";
import { cryptographicModuleTypes } from "./cryptographicModuleTypes.js";

type CryptographicModuleOptions = {
  stub?: boolean;
};

export function cryptographicModuleFactory({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stub,
}: CryptographicModuleOptions) {
  return new ContainerModule(({ bind }) => {
    bind(cryptographicModuleTypes.GenerateKeyPairUseCase).to(
      GenerateKeyPairUseCase,
    );
    bind(cryptographicModuleTypes.EncryptKeyPairUseCase).to(
      EncryptKeyPairUseCase,
    );
    bind(cryptographicModuleTypes.GetEncryptionKeyUseCase).to(
      GetEncryptionKeyUseCase,
    );
    bind(cryptographicModuleTypes.GetOrCreateKeyPairUseCase).to(
      GetOrCreateKeyPairUseCase,
    );
    bind(cryptographicModuleTypes.DecryptKeyPairUseCase).to(
      DecryptKeyPairUseCase,
    );
  });
}
