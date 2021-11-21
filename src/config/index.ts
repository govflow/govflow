import merge from 'deepmerge';
import dotenv from 'dotenv';
import path from 'path';
import { initEngine, initMigrator } from '../db/engine';
import logger from '../logging';
import type { AppSettings, Config } from '../types';

dotenv.config();

const defaultSettings: AppSettings = {
    'env': process.env.NODE_ENV || 'development',
    'databaseUrl': process.env.DATABASE_URL,
    'appPort': process.env.APP_PORT || 3000,
    'databaseExtraMigrationPaths': ''
}

async function resolveCustomConfig(): Promise<Config> {
    const customConfigModule = process.env.CONFIG_MODULE_PATH || '';
    try {
        const resolvedPath = path.resolve(customConfigModule);
        const config = await import(resolvedPath);
        return config;
    } catch (error) {
        logger.warn(`No custom config found at '${customConfigModule}'.`)
    }
    return {};
}

export async function initConfig(): Promise<Config> {
    const customConfig = await resolveCustomConfig();
    const config = {} as Config;

    if (Object.hasOwnProperty.call(customConfig, 'models')) {
        config.models = customConfig.models;
    }

    if (Object.hasOwnProperty.call(customConfig, 'plugins')) {
        config.plugins = customConfig.plugins;
    }

    if (Object.hasOwnProperty.call(customConfig, 'settings')) {
        config.settings = merge(defaultSettings, customConfig.settings as AppSettings);
    } else {
        config.settings = { ...defaultSettings };
    }

    config.database = initEngine(config.settings.databaseUrl as string);
    config.migrator = initMigrator(config.database, config.settings.databaseExtraMigrationPaths as string);

    Object.freeze(config);

    return config;
}
