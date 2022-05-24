# Gov Flow

[![codecov](https://codecov.io/gh/govflow/govflow/branch/main/graph/badge.svg?token=YzXArcY8fH)](https://codecov.io/gh/govflow/govflow)

An open, modular work order and workflow management system for local governments and resident satisfaction.

## What we are building

Our aim is to build an open source solution that address the following aspects of government service delivery:

- 311 request management ("there is a pothole in my street")
- general questions and comments from the public ("what time does the library open")
- "internal" request management ("there is a water leak on the 4th floor of town hall")
- centralized views of request management status and analytics ("what is our work volume at present and how do we perform over time?")

For smaller cities, we'd like to be able to meet all their work management needs with Gov Flow. For larger cities, we intend to build out integrations with existing CRMs and ticket management software.

We have a focus on expanding "input channels" for requests. The API server currently supports API calls for new requests (used by our web form), and an endpoint for inbound emails. We plan to expand to SMS, chatbots, and potentially other entry points such as audio messages, and social media apps. If you have specific interest or use cases in this area, please talk to us by starting a discussion.

## How we are building it

We are currently a small team within [Zencity](https://zencity.io). We have a high-level roadmap, and we prioritize features based on real use cases with our early adopter users.

The API server (this codebase) is open source. We have some UI components that we have not yet open sourced. If you are interested in Gov Flow and need some pointers on building UI please open a ticket or a discussion and talk to us about your needs.

# Get involved

- **[Discussions](https://github.com/govflow/govflow/discussions)**: We discuss new features, architecture and so on in our Discussions forum. Feel free to take part in existing discussions or start a new one.
- **[Issues](https://github.com/govflow/govflow/issues)**: If you find a bug, or have some input on the codebase, feel free to open an issue.

# Getting started

## Using Gov Flow

**Install Gov Flow from npm:**

```bash
npm install @govflow/govflow
```

If you are not modifying Gov Flow with plugins, or embedding Gov Flow into an existing application, you can run the default server. First, you'll need to have a database to connect to and run migrations against:

**Ensure database**:

```bash
createdb govflow
```

Ensure your new database is declated in an environment variable:

```bash
# similar to the following
DATABASE_URL=postgres://<YOUR_USER>@localhost:5432/govflow
```

**Ensure object storage**:

GovFlow stores file on an S3-compatible object storage backend. Install minio and set the `STORAGE_` environment variables appropriately.

**Run migrations**:

```bash
npx govflow-migrate up

# migrate backwards with npx govflow-migrate down
# govflow-migrate is a wrapper around Umzug so see:
# https://github.com/sequelize/umzug
```

**Run the default server:**

```bash
npx govflow-start
```

You can then visit `localhost:3000/` in your browser to see the base API endpoint.

**Other CLI commands**:

There are some other CLI commands available when Gov Flow is installed. The API for the CLI will change, but for now the following are available:

```
npx govflow-start
npx govflow-migrate
npx govflow-generate-fake-data
npx govflow-send-test-email
npx govflow-send-test-sms
npx govflow-send-test-dispatch
```

**Create a custom entrypoint:**

If you plan to modify Gov Flow with plugins or any custom configuration or integrations, create your own entrypoint based on the following:

```typescript

// my-govflow-extension/config.ts
import { MyServiceRepositoryPlugin } from './repositories';

export const plugins = []; // your plugins here.
export const config = {}; // your config here.

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

Provides a configuration object to store various config for the system. The configuration object is backed by [nconf](https://github.com/indexzero/nconf).

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

# Communications

An important part of any workflow management ot 311 system is communication with public users who submit requests, and staff users who handle requests. Gov Flow currently supports email and SMS for such *transactional messaging*.

SendGrid is used as the email backend, and Twilio is used as the SMS backend. You will need to setup accounts and credentials at both providers to send messages from GovFlow.

## Configuration

The following configuration variables need to be set on the environment:

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_PHONE`

The following configuration variables are not required for messaging to work, but are required for message templates to be meaningful:

- `APP_CLIENT_URL`
- `APP_PUBLIC_EMAIL`

An additional configuration variable allows bypassing the backends and sending messages to console for testing and development (see below):

- `COMMUNICATIONS_TO_CONSOLE`

## Manual messaging to verify the backends

`make send-email`, `make send-sms`, and `make send-dispatch` can be used to send test messages. You will need to set `TEST_TO_EMAIL` and `TEST_TO_PHONE` environment variables to receive these messages. All credentials will need to be properly set for these manual tests to work. `make send-dispatch` sets `COMMUNICATIONS_TO_CONSOLE` to undefined to force usage of the backend provider, and, it uses the higher-level `dispatchMessage` function that us used by the dispatch handler in the app, rather than the low-level `sendSms` and `sendEmail` functions.

## Messages to console

**Important**: if the `COMMUNICATIONS_TO_CONSOLE` environment variable is set to any truthy value, then SMS and email messages will be logged to the console and will not be sent to the backend service providers. We highly recommend setting this environment variable for local development, and in particular for running tests. Even if all backend provider credentials are set, if `COMMUNICATIONS_TO_CONSOLE` is truthy, then they will not be used to send messages.

# File support

Gov Flow supports files (usually images) being added to service requests. File support is a client/server architecture where the actual file storage is on an S3-compatible object storage (for object storage solutions that are not S3 compatible, namely, Azure Blog Storage, Minio can be used as a gateway to provide the required API).

## The flow

- A client (such as a service request submission form, or an administration dashboard for 311 work management) provides functionality to allow users to (i) upload, or (ii) view, a file.
- The client submits the file name to the appropriate Gov Flow storage endpoint to either (i) get a presigned PUT url, or (ii) get a presigned GET url.
- The server responds with a URL, time limited in usage, to perform the appropriate PUT or GET request from the client.
- The client performs the appropriate action with the new url.
- In the case of allowing users to upload URLs, for example for a new service request, the client submits the service request payload with an array of image URLs, not actual images.

## Configuration

The following environment variables are required:

`STORAGE_BUCKET` // default 'govflow_uploads'
`STORAGE_REGION` // default 'us-east-1'
`STORAGE_SSL` // default 1 which is cast to true
`STORAGE_PORT`
`STORAGE_ENDPOINT`
`STORAGE_ACCESS_KEY`
`STORAGE_SECRET_KEY`
`STORAGE_SIGNED_GET_EXPIRY` // minutes for get urls to expiry

# Testing and development

The simplest solution is to run an instance of minio locally. See the GitHub workflow, which runs a minio instance for the test suite, and see the Minio documentation at https://min.io
