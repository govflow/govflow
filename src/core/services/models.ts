import { DataTypes } from 'sequelize';
import { Model } from '../../types';

const ServiceModel: Model = {
    name: 'Service',
    attributes: {
        code: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },
        clientId: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        description: {
            allowNull: true,
            type: DataTypes.STRING,
        },
    },
    options: {
        indexes: [{ unique: true, fields: ['name', 'parentId', 'clientId'] }]
    }
}

export {
    ServiceModel
};
