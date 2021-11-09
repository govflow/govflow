import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';

export const ClientModel: ModelDefinition = {
    name: 'Client',
    attributes: {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        jurisdictionId: {
            type: DataTypes.STRING,
            unique: true,
        }
    },
    options: {}
}

export const StaffUserModel: ModelDefinition = {
    name: 'StaffUser',
    attributes: {
        id: { // may come from another system so we want control, not auto-increment.
            type: DataTypes.STRING,
            primaryKey: true,
        },
        firstName: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        lastName: {
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
            validate: {
                // isPhone: true TODO: write something like this with libphonenumber
            }
        }
    },
    options: {}
}
