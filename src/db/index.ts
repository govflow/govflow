import { Model } from 'sequelize';
import logger from '../logging';
import type { DatabaseEngine, ModelDefinition, Models } from '../types';

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

function applyCoreModelRelations(models: Models) {
  const {
    Service,
    ServiceRequest,
    Jurisdiction,
    StaffUser,
    ServiceRequestComment,
    Communication,
    Department,
    InboundMap,
    MessageDisambiguation,
    Template
  } = models;

  Jurisdiction.hasMany(StaffUser, { as: 'staffUsers', foreignKey: 'jurisdictionId' });
  StaffUser.belongsTo(Jurisdiction, { as: 'jurisdiction' });

  Jurisdiction.hasMany(Service, { as: 'services', foreignKey: 'jurisdictionId' });
  Service.belongsTo(Jurisdiction, { as: 'jurisdiction' });

  Jurisdiction.hasMany(ServiceRequest, { as: 'requests', foreignKey: 'jurisdictionId' });
  ServiceRequest.belongsTo(Jurisdiction, { as: 'jurisdiction' });

  Service.hasMany(ServiceRequest, { as: 'requests', foreignKey: 'serviceId' });
  ServiceRequest.belongsTo(Service, { as: 'service' });

  ServiceRequest.hasMany(ServiceRequestComment, { as: 'comments', foreignKey: 'serviceRequestId' });
  ServiceRequestComment.belongsTo(ServiceRequest, { as: 'serviceRequest' });

  ServiceRequest.hasMany(Communication, { as: 'communications', foreignKey: 'serviceRequestId' });
  Communication.belongsTo(ServiceRequest, { as: 'serviceRequest' });

  Jurisdiction.hasMany(Department, { as: 'departments', foreignKey: 'jurisdictionId' });
  Department.belongsTo(Jurisdiction, { as: 'jurisdiction' })

  Department.hasMany(
    ServiceRequest, {
    as: 'serviceRequests',
    foreignKey: 'departmentId',
    onDelete: 'SET NULL',
    onUpdate: 'SET NULL'
  }
  );
  ServiceRequest.belongsTo(Department, { as: 'department' });

  Jurisdiction.hasMany(InboundMap, { as: 'inboundMaps', foreignKey: 'jurisdictionId' });
  InboundMap.belongsTo(Jurisdiction, { as: 'jurisdiction' });

  Jurisdiction.hasMany(MessageDisambiguation, { as: 'messageDisambiguations', foreignKey: 'jurisdictionId' });
  MessageDisambiguation.belongsTo(Jurisdiction, { as: 'jurisdiction' });

  Department.hasMany(InboundMap, { as: 'inboundMaps', foreignKey: 'departmentId' });
  InboundMap.belongsTo(Department, { as: 'department' });

  // StaffUser.hasMany(InboundMap, { as: 'inboundMaps', foreignKey: 'staffUserId' });
  // InboundMap.belongsTo(StaffUser, { as: 'staffUser' });

  Service.hasMany(InboundMap, { as: 'inboundMaps', foreignKey: 'serviceId' });
  InboundMap.belongsTo(Service, { as: 'service' });

  ServiceRequest.hasMany(InboundMap, { as: 'inboundMaps', foreignKey: 'serviceRequestId' });
  InboundMap.belongsTo(ServiceRequest, { as: 'serviceRequest' });

  Jurisdiction.hasMany(Template, { as: 'templates', foreignKey: 'jurisdictionId' });
  Template.belongsTo(Jurisdiction, { as: 'jurisdiction' });
}

function registerModels(
  databaseEngine: DatabaseEngine,
  coreModels: ModelDefinition[],
  customModels: ModelDefinition[]
): DatabaseEngine {
  coreModels.forEach((model) => {
    const { name, attributes, options } = model;
    databaseEngine.define(name, attributes, options);
  });

  if (customModels) {
    customModels.forEach((model) => {
      const { name, attributes, options } = model;
      databaseEngine.define<Model>(name, attributes, options);
    });
  }

  applyCoreModelRelations(databaseEngine.models as unknown as Models);

  // TODO: Apply relations for custom models?

  return databaseEngine;
}
