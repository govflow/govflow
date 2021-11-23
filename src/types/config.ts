import type { DatabaseEngine, MigrationEngine, ModelDefinition, Plugin } from '.';
import type { RequestHandler } from 'express';

export type AppSettings = Record<string, unknown>;

export interface Config {
    plugins?: Plugin[],
    // TODO: models as plugins
    models?: ModelDefinition[]
    middlewares?: RequestHandler[];
    settings?: AppSettings,
    database?: DatabaseEngine,
    migrator?: MigrationEngine
}
