import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';

export const ClientModel: ModelDefinition = {
    name: 'Client',
    attributes: {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        }
    },
    options: {}
}
