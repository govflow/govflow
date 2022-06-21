import { DataTypes } from 'sequelize';
import type { ModelDefinition } from '../../types';

export const JurisdictionModel: ModelDefinition = {
    name: 'Jurisdiction',
    attributes: {
        id: {
            // may come from another system so we want control:
            // not auto-increment, and not necessairly UUID.
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        email: {
            allowNull: true,
            type: DataTypes.STRING,
            validate: { isEmail: true }
        },
        enforceAssignmentThroughDepartment: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        filterBroadcastsByDepartment: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        sendFromPhone: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        sendFromEmail: {
            allowNull: true,
            type: DataTypes.STRING,
            validate: { isEmail: true }
        },
        sendFromEmailVerified: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN,
        },
        replyToEmail: {
            allowNull: true,
            type: DataTypes.STRING,
            validate: { isEmail: true }
        },
        replyToServiceRequestEnabled: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN,
        },
        broadcastToSubmitterOnRequestClosed: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN,
        },
        address: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        city: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        state: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        country: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        zip: {
            allowNull: true,
            type: DataTypes.STRING,
        },
    },
    options: {
        freezeTableName: true
    }
}
