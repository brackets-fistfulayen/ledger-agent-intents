export const cryptographicModuleTypes = {
  GenerateKeyPairUseCase: Symbol.for("GenerateKeyPairUseCase"),
  EncryptKeyPairUseCase: Symbol.for("EncryptKeyPairUseCase"),
  GetEncryptionKeyUseCase: Symbol.for("GetEncryptionKeyUseCase"),
  GetOrCreateKeyPairUseCase: Symbol.for("GetOrCreateKeyPairUseCase"),
  DecryptKeyPairUseCase: Symbol.for("DecryptKeyPairUseCase"),
} as const;
