import { Model } from 'sequelize';
import logger from '../logging';
import type { DatabaseEngine, ModelDefinition } from '../types';

export async function initDb(databaseEngine: DatabaseEngine, coreModels: ModelDefinition[], customModels: ModelDefinition[]): Promise<DatabaseEngine> {
    await verifyDatabaseConnection(databaseEngine);
    registerModels(databaseEngine, coreModels, customModels);
    return databaseEngine;
}

async function verifyDatabaseConnection(databaseEngine: DatabaseEngine): Promise<void> {
    try {
        await databaseEngine.authenticate();
        logger.info('Successfully connected to database.');
    } catch (error) {
        logger.error('Cannot connect to database.');
        throw new Error(`${error}`);
    }
}

function applyCoreModelRelations(models: Record<string, Model>) {
    /* eslint-disable */
    const { Service, ServiceRequest, Jurisdiction, StaffUser, ServiceRequestComment, Event } = models;
    //@ts-ignore
    Jurisdiction.hasMany(StaffUser, { as: 'staffUsers', foreignKey: 'jurisdictionId' });
    //@ts-ignore
    StaffUser.belongsTo(Jurisdiction, { as: 'jurisdiction' })
    //@ts-ignore
    Jurisdiction.hasMany(Service, { as: 'services', foreignKey: 'jurisdictionId' });
    //@ts-ignore
    Service.belongsTo(Jurisdiction, { as: 'jurisdiction' });
    //@ts-ignore
    Jurisdiction.hasMany(ServiceRequest, { as: 'requests', foreignKey: 'jurisdictionId' });
    //@ts-ignore
    ServiceRequest.belongsTo(Jurisdiction, { as: 'jurisdiction' });
    //@ts-ignore
    Jurisdiction.hasMany(Event, { as: 'events', foreignKey: 'jurisdictionId' });
    //@ts-ignore
    Event.belongsTo(Jurisdiction, { as: 'jurisdiction' });
    //@ts-ignore
    Service.hasMany(Service, { as: 'children', foreignKey: 'parentId' });
    //@ts-ignore
    Service.belongsTo(Service, { as: 'parent' });
    //@ts-ignore
    Service.hasMany(ServiceRequest, { as: 'requests', foreignKey: 'serviceId' });
    //@ts-ignore
    ServiceRequest.belongsTo(Service, { as: 'service' });
    //@ts-ignore
    ServiceRequest.hasMany(ServiceRequestComment, { as: 'comments', foreignKey: 'serviceRequestId' });
    //@ts-ignore
    ServiceRequestComment.belongsTo(ServiceRequest, { as: 'serviceRequest' });
    /* eslint-enable */

}

function registerModels(databaseEngine: DatabaseEngine, coreModels: ModelDefinition[], customModels: ModelDefinition[]): DatabaseEngine {
    coreModels.forEach((model) => {
        const { name, attributes, options } = model;
        databaseEngine.define(name, attributes, options);
    });

    customModels.forEach((model) => {
        const { name, attributes, options } = model;
        databaseEngine.define(name, attributes, options);
    });
    /* eslint-disable */
    //@ts-ignore
    applyCoreModelRelations(databaseEngine.models);
    /* eslint-enable */

    // TODO: Apply relations for custom models?

    return databaseEngine;
}
