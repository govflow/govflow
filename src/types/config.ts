import type { RequestHandler } from 'express';
import type { DatabaseEngine, MigrationEngine, ModelDefinition, Plugin } from '.';

export interface AppSettings {
    [key: string]: boolean | string | number | Record<string, string | number>,
    env: string,
    databaseUrl: string,
    databaseExtraMigrationPaths: string,
    sendGridApiKey: string,
    sendGridFromEmail: string,
    twilioAccountSid: string,
    twilioAuthToken: string,
    twilioFromPhone: string,
    testToEmail: string,
    testToPhone: string,
    appPort: number,
    appName: string,
    appClientUrl: string,
    appClientRequestsPath: string,
    communicationsToConsole: string,
    captchaEnabled: boolean;
    reCaptchaSecretKey: string;
}

export interface Config {
    plugins?: Plugin[],
    // TODO: models as plugins
    models?: ModelDefinition[]
    middlewares?: RequestHandler[];
    settings?: AppSettings,
    database?: DatabaseEngine,
    migrator?: MigrationEngine
}
