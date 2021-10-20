import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';
import { isValidToSchema, serviceExtraAttrsSchema } from './schemas';

const validExtras = isValidToSchema(serviceExtraAttrsSchema);

const ServiceModel: ModelDefinition = {
    name: 'Service',
    attributes: {
        id: { // save code here for Open311 integration
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        description: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        metadata: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        type: {
            type: DataTypes.ENUM('realtime', 'batch', 'blackbox'),
            defaultValue: 'realtime',
        },
        keywords: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        extraAttrs: {
            type: DataTypes.JSONB,
            allowNull: true,
            validate: {
                validExtras
            }
        }
    },
    options: {
        indexes: [{ unique: true, fields: ['name', 'parentId', 'clientId'] }]
    }
}

export {
    ServiceModel
};
