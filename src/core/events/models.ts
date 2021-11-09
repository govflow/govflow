import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';
import { eventActorSchema, isValidToSchema } from '../schemas';

const validActor = isValidToSchema(eventActorSchema);

export const EventModel: ModelDefinition = {
    name: 'Event',
    attributes: {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        sender: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        actor: {
            type: DataTypes.JSONB,
            allowNull: false,
            validate: {
                validActor
            }
        },
    },
}
