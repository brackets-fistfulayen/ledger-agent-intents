import { Factory } from 'inversify';
import { LoggerPublisher } from '../../../logger/service/LoggerPublisher.js';
import { StorageService } from '../../StorageService.js';
import { KeyPairMigrationService } from './KeypairMigrationService.js';
export declare class MigrateDbUseCase {
    private readonly loggerFactory;
    private readonly storageService;
    private readonly keyPairMigrationService;
    private logger;
    constructor(loggerFactory: Factory<LoggerPublisher>, storageService: StorageService, keyPairMigrationService: KeyPairMigrationService);
    execute(): Promise<void>;
    /**
     * During the first iteration of the app, the keyPair wasn't encrypted.
     * After a dungeon review it was decided to encrypt the keyPair.
     */
    private migrateToV1;
    /**
     * Migrates the database version storage from localStorage to IndexedDB.
     * This ensures the version is stored in a more persistent and reliable storage.
     */
    private migrateToV2;
}
//# sourceMappingURL=MigrateDbUseCase.d.ts.map