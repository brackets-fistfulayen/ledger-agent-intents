export const storageModuleTypes = {
  StorageService: Symbol.for("StorageService"),
  IndexedDbService: Symbol.for("IndexedDbService"),
  MigrateDbUseCase: Symbol.for("MigrateDbUseCase"),
  KeyPairMigrationService: Symbol.for("KeyPairMigrationService"),
} as const;
