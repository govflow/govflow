import { QueryInterface, Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';
import { config } from '../config';
import logger from '../logging';
import type { AppSettings, ModelDefinition } from '../types';

export const databaseEngine = new Sequelize(config.get('database_url'), {
    logging: msg => logger.debug(msg),
});

export const migrator = getMigrator(databaseEngine);

export function getMigrator(sequelize: Sequelize): Umzug<QueryInterface> {
    return new Umzug({
        migrations: { glob: 'src/migrations/*.ts' },
        context: databaseEngine.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize }),
        logger: logger,
    });
}

export async function initDb(coreModels: ModelDefinition[], appSettings: AppSettings | void): Promise<Sequelize> {
    await verifyDatabaseConnection(databaseEngine);
    registerModels(databaseEngine, coreModels, appSettings);
    await databaseEngine.sync();
    // check migrations, and apply migrations that have not been applied
    await migrator.up();
    return databaseEngine;
}

async function verifyDatabaseConnection(databaseEngine: Sequelize): Promise<void> {
    try {
        await databaseEngine.authenticate();
        logger.info('Successfully connected to database.');
    } catch (error) {
        logger.error('Cannot connect to database.');
        throw new Error(`${error}`);
    }
}

function applyCoreModelRelations(models: typeof databaseEngine.models) {
    const { Service, ServiceRequest, Client, StaffUser, ServiceRequestComment, Event } = models;

    Client.hasMany(StaffUser, { as: 'staffUsers', foreignKey: 'clientId' });
    StaffUser.belongsTo(Client, { as: 'client' })

    Client.hasMany(Service, { as: 'services', foreignKey: 'clientId' });
    Service.belongsTo(Client, { as: 'client' });

    Client.hasMany(ServiceRequest, { as: 'requests', foreignKey: 'clientId' });
    ServiceRequest.belongsTo(Client, { as: 'client' });

    Client.hasMany(Event, { as: 'events', foreignKey: 'clientId' });
    Event.belongsTo(Client, { as: 'client' });

    Service.hasMany(Service, { as: 'children', foreignKey: 'parentId' });
    Service.belongsTo(Service, { as: 'parent' });

    Service.hasMany(ServiceRequest, { as: 'requests', foreignKey: 'serviceId' });
    ServiceRequest.belongsTo(Service, { as: 'service' });

    ServiceRequest.hasMany(ServiceRequestComment, { as: 'comments', foreignKey: 'serviceRequestId' });
    ServiceRequestComment.belongsTo(ServiceRequest, { as: 'serviceRequest' });

    StaffUser.hasMany(ServiceRequest, { as: 'requests', foreignKey: 'assignedToId' });
    ServiceRequest.belongsTo(StaffUser, { as: 'assignedTo' });

}

function registerModels(databaseEngine: Sequelize, coreModelDefinitions: ModelDefinition[], appSettings: AppSettings | void): Sequelize {
    coreModelDefinitions.forEach((model) => {
        const { name, attributes, options } = model;
        databaseEngine.define(name, attributes, options);
    });

    // This will override any previous definitions with a same name.
    if (appSettings && Object.hasOwnProperty.call(appSettings, 'models')) {
        appSettings.models.forEach((model) => {
            const { name, attributes, options } = model;
            databaseEngine.define(name, attributes, options);
        });
    }

    applyCoreModelRelations(databaseEngine.models);

    // TODO: Apply relations for custom models?

    return databaseEngine;
}
