import type { DatabaseEngine, MigrationEngine, ModelDefinition, Plugin } from '.';

export type AppSettings = Record<string, unknown>;

export interface Config {
    plugins?: Plugin[],
    // TODO: models as plugins
    models?: ModelDefinition[]
    settings?: AppSettings,
    database?: DatabaseEngine,
    migrator?: MigrationEngine
}
