#! /usr/bin/env node
import { initConfig } from '../config';
import { initMigrator } from '../db/engine';
import type { DatabaseEngine } from '../types';

(async () => {
    const config = await initConfig();
    const { database } = config;
    const migrator = initMigrator(database as DatabaseEngine, config.plugins?.migrations);
    migrator.runAsCLI();
})();
