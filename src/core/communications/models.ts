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
        // has the payload been sent to the provider
        dispatched: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        // what payload was sent to the provider
        dispatchPayload: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        // what response the provider gave for our dispatch
        dispatchResponse: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        // did the provider accept our payload?
        // if the provider did not respond with an SID, or a 202 status code,
        // or possibly other response data that indicates they have accepted our payload
        // then, accepted will be false.
        // reasons for that could be invalid account credentials, an invalid payload,
        // or specifically, an invalid communication address (i.e.: email or phone provided is not valid).
        // Also if the request simply fails then accepted will be false.
        // TODO: In future we probably need to handle these various possible states with more granularity.
        accepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: null,
            allowNull: false,
        },
        // TODO: Check after dispatch with the backends and verify delivery.
        // For now, we set delivered to true with a successful dispatch, but with
        // some communication backends, like twilio SMS, the dispatch really means
        //it has been queued and is pending for delivery and we can poll later to
        // check actual delivery.
        delivered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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

export const InboundMapModel: ModelDefinition = {
    name: 'InboundMap',
    attributes: {
        id: {
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
    },
    options: {
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['id', 'jurisdictionId', 'departmentId']
            }
        ]
    }
}