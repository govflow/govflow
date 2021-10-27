# Gov Flow

An open, modular work order and workflow management system for local governments and resident satisfaction.

# Getting started

## Using Gov Flow

**Install Gov Flow from npm:**

```bash
npm install govflow
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
# my_src/index.ts

import { Server } from 'http';
import { createApp } from '../index';
import logger from '../logging';

const APP_PORT: number = parseInt(process.env.APP_PORT || '3000');

async function defaultServer(): Promise<Server> {
    // optionally, you can pass appSettings to createApp for further customization
    const app = await createApp();
    return app.listen(APP_PORT, () => {
        logger.info(`application listening on ${APP_PORT}.`)
    });
}

(async () => { return await defaultServer() })();
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

Configuration is defined on the `Config` class in the `config` module. Configuration is read from environment variables, and/or, passed explicitly as `appSettings.config` to `createApp`.

## Entry point

The primary entry point is the `createApp` factory function defined in `src/index.ts`. This function optionally accepts an `appSettings` object which allows for provision of custom plugins, custom configuration values, and custom models.

`createApp` needs to be called in order to initialize the system correctly. `createApp` returns an Express.js `Application`instance `app`. `app` is provisioned with easy access to configuration at `app.config`, registered plugins at `app.plugins`, and repositories at `app.repositories` (repositories are used for all data access). The database is also configured via `createApp`, and is usable after `createApp` has been called by exporting `databaseEngine` from `src/db`.

## Extensibility

Gov Flow is designed to be shaped for specific use cases and system integrations. Existing behavior can be modified or extended via **plugins** or custom **models**. Over time, such customizations will be available as extensions, downloadable via npm, contributed by the core maintainers and the wider community of users.

### Plugins

Gov Flow exposes a number of interfaces that can have their behaviour customized via plugins. All interfaces abstractions that can be customized in this way are prefixed with `I` and are bound to a concrete implementation via IoC containers instantiated in the `registry` module. The default concrete implementations are part of the `src/core` module - see the [Module](#modules) overview below for further information on the organization of the codebase.

In the current release, `repository` interfaces can be customized via plugins. Repositories are a data access abstraction layer - see the tests for examples of how they are used, and how custom implementations can be provided.

Future releases may see interfaces that can be customised via plugins for routes, models, and so on.

#### Providing a plugin

See the tests, and the `createApp` function for examples of how to provide a plugin. Basically, `createApp` takes an optional `appSettings` object with an optional `appSettings.plugins` property. Each plugin is registered in a central registry, and then bound to the relevant part of the system.

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
