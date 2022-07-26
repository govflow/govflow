import merge from 'deepmerge';
import dotenv from 'dotenv';
import path from 'path';
import { initEngine, initMigrator } from '../db/engine';
import logger from '../logging';
import type { AppConfig } from '../types';

declare global {
    // eslint-disable-next-line no-var
    var appCustomConfig: Partial<AppConfig>
}

dotenv.config();

const defaultConfig: Partial<AppConfig> = {
    'env': process.env.NODE_ENV || 'development',
    'databaseUrl': process.env.DATABASE_URL || '',
    'sendGridApiKey': process.env.SENDGRID_API_KEY || '',
    'sendGridFromEmail': process.env.SENDGRID_FROM_EMAIL || '',
    'sendGridSignedWebhookVerificationKey': process.env.SENDGRID_SIGNED_WEBHOOK_VERIFICATION_KEY || '',
    'twilioAccountSid': process.env.TWILIO_ACCOUNT_SID || '',
    'twilioAuthToken': process.env.TWILIO_AUTH_TOKEN || '',
    'twilioFromPhone': process.env.TWILIO_FROM_PHONE || '',
    'twilioStatusCallbackURL': process.env.TWILIO_STATUS_CALLBACK_URL || '',
    'sentryDsn': process.env.SENTRY_DSN || '',
    'sentryEnvironment': process.env.SENTRY_ENVIRONMENT || '',
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
    'inboundEmailDomain': process.env.INBOUND_EMAIL_DOMAIN || 'inbound.example.com',
}

async function resolveCustomConfig(): Promise<AppConfig> {
    if (global.appCustomConfig) {
        return global.appCustomConfig as AppConfig;
    }
    const customConfigModule = process.env.CONFIG_MODULE_PATH || '';
    try {
        const resolvedPath = path.resolve(customConfigModule);
        const { config } = await import(resolvedPath);
        return config;
    } catch (error) {
        logger.warn(`No custom config found at '${customConfigModule}'.`)
    }
    return {} as AppConfig;
}

export async function initConfig(): Promise<AppConfig> {
    const customConfig = await resolveCustomConfig();
    const config = merge(defaultConfig, customConfig) as AppConfig;
    config.database = initEngine(config.databaseUrl as string);
    config.migrator = initMigrator(config.database, config.plugins?.migrations);
    Object.freeze(config);
    return config;
}
