import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';
import { eventActorSchema, eventSenderSchema, isValidToSchema } from '../schemas';

const validActor = isValidToSchema(eventActorSchema);
const validSender = isValidToSchema(eventSenderSchema);

export const EventModel: ModelDefinition = {
    name: 'Event',
    attributes: {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        sender: {
            type: DataTypes.JSONB,
            allowNull: false,
            validate: {
                validSender
            }
        },
        actor: {
            type: DataTypes.JSONB,
            allowNull: false,
            validate: {
                validActor
            }
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    options: {
        freezeTableName: true,
        indexes: [
            {
                unique: false,
                fields: ['createdAt']
            },
            {
                unique: false,
                fields: ['updatedAt']
            }
        ]
    }
}
