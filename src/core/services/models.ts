import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';

const ServiceModel: ModelDefinition = {
    name: 'Service',
    attributes: {
        code: {
            type: DataTypes.STRING,
            allowNull: false,
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
        clientId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    options: {
        indexes: [{ unique: true, fields: ['name', 'parentId', 'clientId'] }]
    }
}

export {
    ServiceModel
};
