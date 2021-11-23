import type { Application } from 'express';
import express from 'express';
import _ from 'lodash';
import 'reflect-metadata';
import { initConfig } from './config';
import { coreMiddlewares, coreModels, coreRoutes } from './core';
import { initDb } from './db';
import { bindImplementationsFromPlugins, registerPlugins } from './registry';
import type { AppSettings, DatabaseEngine, MigrationEngine, Plugin, QueryResult } from './types';

/* eslint-disable */
// TODO: can we do this without using namespace?
declare global {
    namespace Express {
        interface Application {
            plugins: Plugin[];
            config: AppSettings;
            repositories: Record<string, any>;
            database: DatabaseEngine;
            migrator: MigrationEngine;
        }
        interface Request {
            jurisdiction: QueryResult;
        }
    }
}
/* eslint-enable */

export async function createApp(): Promise<Application> {

    // Read custom configurations from appSettings and register
    // onto config, including overriding existing configurations.
    const config = await initConfig();

    // Normalize here to keep our init and bind functions clean.
    let { plugins: customPlugins, models: customModels } = config;
    if (_.isNil(customPlugins)) { customPlugins = [] }
    if (_.isNil(customModels)) { customModels = [] }

    // TODO: consolidate with above
    await initDb(config.database as DatabaseEngine, coreModels, customModels)

    // Read all plugins into a central plugin registry.
    const plugins = registerPlugins(customPlugins);

    // We use IoC containers to declare dependencies throughout the system.
    // Currently, plugins can provide alternate implementations of
    // repositories and in future they will be able to provide
    // implementations of other aspects of the system.
    const repositories = bindImplementationsFromPlugins(plugins, config.database as DatabaseEngine);

    // Start bootstrapping the app itself.
    const app = express();

    // Attach data to the app.
    app.config = config.settings as AppSettings;
    app.database = config.database as DatabaseEngine;
    app.migrator = config.migrator as MigrationEngine;
    app.plugins = plugins;
    app.repositories = repositories;

    // Use core middleware and mount routes.
    app.use(coreMiddlewares);
    app.use('/', coreRoutes);

    return app;
}
