import type { DatabaseEngine, MigrationEngine } from '.';
import { PluginRegistry } from './registry';

export interface AppConfig {
    [x: string]: unknown;
    env: string;
    databaseUrl: string;
    sendGridApiKey: string;
    sendGridFromEmail: string;
    sendGridSignedWebhookVerificationKey: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioFromPhone: string;
    testToEmail: string;
    testToPhone: string;
    appPort: number;
    appName: string;
    appClientUrl: string;
    appClientRequestsPath: string;
    storageBucket: string;
    storageRegion: string;
    storageSSL: boolean;
    storagePort: number;
    storageEndpoint: string;
    storageAccessKey: string;
    storageSecretKey: string;
    storageSignedGetExpiry: number;
    inboundEmailDomain: string;
    communicationsToConsole: string;
    captchaEnabled: boolean;
    reCaptchaSecretKey: string;
    plugins?: PluginRegistry;
    database?: DatabaseEngine;
    migrator?: MigrationEngine;
}
