import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';

export const StaffUserModel: ModelDefinition = {
    name: 'StaffUser',
    attributes: {
        id: { // may come from another system so we want control, not auto-increment.
            type: DataTypes.STRING,
            primaryKey: true,
        },
        first_name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        last_name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            validate: { isEmail: true }
        },
        phone: {
            allowNull: true,
            type: DataTypes.STRING,
            validate: { isPhone: true }
        }
    },
    options: {}
}
