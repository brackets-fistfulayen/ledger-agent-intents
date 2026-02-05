import { MigrateDbUseCase } from './MigrateDbUseCase.js';
export declare const mockKeyPairBuffer: Uint8Array<ArrayBuffer>;
export declare const createMockStorageService: () => {
    getDbVersion: any;
    setDbVersion: any;
    removeItem: any;
    getKeyPair: any;
};
export declare const createMockLogger: () => {
    info: any;
};
export declare const createMockLoggerFactory: (mockLogger: ReturnType<typeof createMockLogger>) => any;
export declare const createMockKeyPairMigrationService: () => {
    migrateKeyPairToEncrypted: any;
};
export declare const createMigrateDbUseCase: (mockStorageService: ReturnType<typeof createMockStorageService>, mockLoggerFactory: ReturnType<typeof createMockLoggerFactory>, mockKeyPairMigrationService: ReturnType<typeof createMockKeyPairMigrationService>) => MigrateDbUseCase;
//# sourceMappingURL=MigrateDbUseCase.mock.d.ts.map