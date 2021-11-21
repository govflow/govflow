import { initConfig } from '../config';
import { initMigrator } from '../db/engine';
import type { DatabaseEngine } from '../types';

(async () => {
    const config = await initConfig();
    const { database, settings } = config;
    const migrator = initMigrator(database as DatabaseEngine, settings?.databaseExtraMigrationPaths as string);
    migrator.runAsCLI();
})();
