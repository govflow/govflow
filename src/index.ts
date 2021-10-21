import type { Application } from 'express';
import express from 'express';
import 'reflect-metadata';
import { registerConfig } from './config';
import { coreMiddlewares, coreModels, coreRoutes } from './core';
import { initDb } from './db';
import { bindImplementationsFromPlugins, getRespositories, registerPlugins } from './registry';
import type { AppSettings, Config, DatabaseEngine, Plugin } from './types';

/* eslint-disable */
// TODO: can we do this without using namespace?
declare global {
    namespace Express {
        interface Application {
            plugins: Plugin[];
            config: Config;
            repositories: Record<string, any>;
            database: DatabaseEngine;
        }
    }
}
/* eslint-enable */

async function createApp(appSettings: AppSettings | void): Promise<Application> {

    // Read all plugins into a central plugin registry.
    const pluginRegistry: Plugin[] = registerPlugins(appSettings);

    // We use IoC containers to declare dependencies throughout the system.
    // Currently, plugins can provide alternate implementations of
    // repositories and in future they will be able to provide
    // implementations of other aspects of the system.
    bindImplementationsFromPlugins(pluginRegistry);

    // Read custom configurations from appSettings and register
    // onto config, including overriding existing configurations.
    const config = registerConfig(appSettings);

    // Init the database with models, verify the connection, and return the engine.
    await initDb(coreModels, appSettings);

    // Start bootstrapping the app itself.
    const app = express();

    // Make our config available to the app.
    app.config = config;

    // Make our plugin registry available to the app.
    app.plugins = pluginRegistry;

    // Get our repositories from their container once, at composition
    // root, and make them available to the app.
    app.repositories = getRespositories();

    // Set our app-level middlewares.
    app.use(coreMiddlewares);

    // Then, mount our core routes.
    app.use('/', coreRoutes);

    return app;
}

export {
    createApp
};
