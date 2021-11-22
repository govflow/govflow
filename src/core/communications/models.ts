import { DataTypes } from 'sequelize';
import type { ModelDefinition } from '../../types';

export const CommunicationModel: ModelDefinition = {
    name: 'Communication',
    attributes: {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        channel: {
            allowNull: false,
            type: DataTypes.ENUM('email', 'sms'),
        },
        dispatched: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        delivered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        response: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
    },
    options: {
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['id', 'serviceRequestId']
            },
            {
                unique: false,
                fields: ['channel']
            },
            {
                unique: false,
                fields: ['createdAt']
            },
            {
                unique: false,
                fields: ['updatedAt']
            },
        ]
    }
}
