import merge from 'deepmerge';
import dotenv from 'dotenv';
import path from 'path';
import { initEngine, initMigrator } from '../db/engine';
import logger from '../logging';
import type { AppSettings, Config } from '../types';

declare global {
    // eslint-disable-next-line no-var
    var config: Config
}

dotenv.config();

const defaultSettings: AppSettings = {
    'env': process.env.NODE_ENV || 'development',
    'databaseUrl': process.env.DATABASE_URL || '',
    'databaseExtraMigrationPaths': '',
    'sendGridApiKey': process.env.SENDGRID_API_KEY || '',
    'sendGridFromEmail': process.env.SENDGRID_FROM_EMAIL || '',
    'twilioAccountSid': process.env.TWILIO_ACCOUNT_SID || '',
    'twilioAuthToken': process.env.TWILIO_AUTH_TOKEN || '',
    'twilioFromPhone': process.env.TWILIO_FROM_PHONE || '',
    'testToEmail': process.env.TEST_TO_EMAIL || '',
    'testToPhone': process.env.TEST_TO_PHONE || '',
    'appPort': parseInt(process.env.APP_PORT || '3000', 10),
    'appName': process.env.APP_NAME || 'Gov Flow',
    'appClientUrl': process.env.APP_CLIENT_URL || '',
    'appClientRequestsPath': process.env.APP_CLIENT_REQUESTS_PATH || '/requests',
    'communicationsToConsole': process.env.COMMUNICATIONS_TO_CONSOLE || '',
    'captchaEnabled': Boolean(parseInt(process.env.CAPTCHA_ENABLED || '1', 10)), // 0 or 1
    'reCaptchaSecretKey': process.env.RECAPTCHA_SECRET_KEY || '',
    'storageBucket': process.env.STORAGE_BUCKET || 'govflow_uploads',
    'storageRegion': process.env.STORAGE_REGION || 'us-east-1',
    'storageSSL': Boolean(parseInt(process.env.STORAGE_SSL || '1', 10)), // 0 or 1
    'storagePort': parseInt(process.env.STORAGE_PORT || '9000', 10),
    'storageEndpoint': process.env.STORAGE_ENDPOINT || '127.0.0.1',
    'storageAccessKey': process.env.STORAGE_ACCESS_KEY || '',
    'storageSecretKey': process.env.STORAGE_SECRET_KEY || '',
    'storageSignedGetExpiry': parseInt(process.env.STORAGE_SIGNED_GET_EXPIRY || '1', 10) * 60, // minutes
    'inboundEmailDomain': process.env.INBOUND_EMAIL_DOMAIN || '',
}

async function resolveCustomConfig(): Promise<Config> {
    if (global.config) {
        return global.config;
    }

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

    if (Object.hasOwnProperty.call(customConfig, 'middlewares')) {
        config.middlewares = customConfig.middlewares;
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
