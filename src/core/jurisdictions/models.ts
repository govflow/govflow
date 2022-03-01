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
    },
    options: {
        freezeTableName: true
    }
}
