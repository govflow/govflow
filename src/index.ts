import type { Application } from 'express';
import express from 'express';
import 'reflect-metadata';
import { initConfig } from './config';
import { coreMiddlewares, coreModels, coreRoutes } from './core';
import { initDb } from './db';
import { bindImplementationsWithPlugins } from './registry';
import type { AppConfig, DatabaseEngine, JurisdictionAttributes, MigrationEngine, ModelPlugin, PluginRegistry, Repositories, Services, StaffUserAttributes } from './types';

/* eslint-disable */
// TODO: can we do this without using namespace?
declare global {
    namespace Express {
        interface Application {
            plugins: PluginRegistry;
            config: AppConfig;
            repositories: Repositories;
            services: Services;
            database: DatabaseEngine;
            migrator: MigrationEngine;
        }
        interface Request {
            jurisdiction: JurisdictionAttributes;
        }
        interface User extends StaffUserAttributes {
        }
    }
}
/* eslint-enable */

export async function createApp(): Promise<Application> {

    // Read custom configurations from appSettings and register
    // onto config, including overriding existing configurations.
    const config = await initConfig();

    await initDb(config.database as DatabaseEngine, coreModels, config.plugins?.models as ModelPlugin[])

    // We use IoC containers to declare dependencies throughout the system.
    // Currently, plugins can provide alternate implementations of
    // repositories and in future they will be able to provide
    // implementations of other aspects of the system.
    const { repositories, services, middlewares } = bindImplementationsWithPlugins(config as AppConfig);

    // Start bootstrapping the app itself.
    const app = express();

    // Attach data to the app.
    app.config = config as AppConfig;
    app.database = config.database as DatabaseEngine;
    app.migrator = config.migrator as MigrationEngine;
    app.plugins = config.plugins as PluginRegistry;
    app.repositories = repositories;
    app.services = services;

    // Use core middleware and mount routes.
    app.use(coreMiddlewares);
    if (middlewares && middlewares.length > 0) {
        app.use(middlewares);
    }
    app.use('/', coreRoutes);

    return app;
}
