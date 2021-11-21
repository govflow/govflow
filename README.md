# Gov Flow

[![codecov](https://codecov.io/gh/govflow/govflow/branch/main/graph/badge.svg?token=YzXArcY8fH)](https://codecov.io/gh/govflow/govflow)

An open, modular work order and workflow management system for local governments and resident satisfaction.

# Getting started

## Using Gov Flow

**Install Gov Flow from npm:**

```bash
npm install @govflow/govflow
```

If you are not modifying Gov Flow with plugins, or embedding Gov Flow into an existing application, you can run the default server.

**Run the default server:**

```bash
npx govflow start
```

You can then visit `localhost:3000/` in your browser to see the base API endpoint.

**Create a custom entrypoint:**

If you plan to modify Gov Flow with plugins or any custom configuration or integrations, create your own entrypoint based on the following:

```typescript

// my-govflow-extension/config.ts
import { MyServiceRepositoryPlugin } from './repositories';

export const plugins = []; // your plugins here.
export const settings = {}; // your settings here.

// my-govflow-extension/index.ts
import type { Server } from 'http';
import { createApp } from '../index';
import logger from '../logging';

async function defaultServer(): Promise<Server> {
    process.env.CONFIG_MODULE_PATH = './my-govflow-extension/config.ts';
    const app = await createApp();
    const port = app.config.appPort;
    return app.listen(port, () => {
        logger.info(`application listening on ${port}.`)
    });
}

export default defaultServer;

```

*Note*: See `src/servers` for examples of ready-to-go server configurations.

*Note:* `createApp` is a factory function that takes custom configuration, and returns an `Express.js` app instance. See [Customization](#customization) for further information on this and other configuration entry points.

## Developing Gov Flow

**Clone the codebase:**

```bash
git clone https://github.com/govflow/govflow.git
```

**View the primary runnable tasks:**

```bash
make
```

**Install dependencies:**

```bash
make install
```

Also ensure that you have Postgres running, and create a database called `govflow` for use.

**Lint code:**

```bash
make lint
```

**Run tests:**

```bash
make test
```

# Customization

## Configuration

Provide a path to your custom configuration module via `process.env.CONFIG_MODULE_PATH`. See `src/config` for how this is read. You can provide new config and overwrite existing config.

## Entry point

The primary entry point is the `createApp` factory function defined in `src/index.ts`.

`createApp` calls `initConfig` which initializes the system correctly. All tools, such as the migration and fake data generator scripts, need to call `initConfig` as part of their initialization flow.

`createApp` returns an Express.js `Application`instance `app`. `app` is provisioned with easy access to configuration at `app.config`, registered plugins at `app.plugins`, and repositories at `app.repositories` (repositories are used for all data access). The database is also configured via `createApp`, and is usable after `createApp` has been called by exporting `databaseEngine` from `src/db`.

## Extensibility

Gov Flow is designed to be shaped for specific use cases and system integrations. Existing behavior can be modified or extended via **plugins**. Over time, such customizations will be available as extensions, downloadable via npm, contributed by the core maintainers and the wider community of users.

### Plugins

Gov Flow exposes a number of interfaces that can have their behaviour customized via plugins. All interfaces abstractions that can be customized in this way are prefixed with `I` and are bound to a concrete implementation via IoC containers instantiated in the `registry` module. The default concrete implementations are part of the `src/core` module - see the [Module](#modules) overview below for further information on the organization of the codebase.

In the current release, `repository` interfaces can be customized via plugins. Repositories are a data access abstraction layer - see the tests for examples of how they are used, and how custom implementations can be provided.

Future releases may see interfaces that can be customised via plugins for routes, models, and so on.

#### Providing a plugin

Provide a path to your custom configuration module via `process.env.CONFIG_MODULE_PATH`, and from that module export a member `plugins` which is an array of `Plugin` types. See examples in the test suite, and see where implementations are bound in `src/registry`.

### Models

#### Providing a model

See the tests for examples of modifying a core model and/or providing an additional model.

*Note*: It is likely that the Plugin concept will be expanded in the future to encapsulate the provision of custom models, and other aspects of the system like routers, so this current API is likely to change.

# Modules

This is a short overview of the modules under `src` in the codebase to help you get oriented, especially while documentation is sparse. Please also review tests, and all functionality of the codebase is on display in the test suite.

## config

Provides a configuration object to store various settings for the system. The configuration object is backed by [nconf](https://github.com/indexzero/nconf).

## core

This provides the core functionality of the system. Here you will find a submodule for each core entity, with its routes, repositories, models, and any business logic.

## db

Provides a database engine object, with verification of the connection, syncing of tables, migration of schema changes, and registration of custom models. [Sequelize](https://github.com/sequelize/sequelize) is used.

## logging

Provides a logger. [Winston](https://github.com/winstonjs/winston) is used.

## migrations

Stores migration directives for [Umzug](https://github.com/sequelize/umzug), Sequelize's tool for programmatic migrations.

## registry

Provides registration and implementation of custom components for the system. Implementation is managed via [Inversify](https://github.com/inversify/InversifyJS) IoC containers.

## servers

Provides server configurations for the app.

## types

Provides all types that the system declares.

## default

Provides the default server configuration to run the system with no customization.

## index

The entry point for the system, providing the `createApp` factory function to initialize and configure an app.
