import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';

export const ClientModel: ModelDefinition = {
    name: 'Client',
    attributes: {
        id: {
            // may come from another system so we want control:
            // not auto-increment, and not necessairly UUID.
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        jurisdictionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    },
    options: {
        indexes: [
            {
                unique: true,
                fields: ['jurisdictionId']
            }
        ]
    }
}

export const StaffUserModel: ModelDefinition = {
    name: 'StaffUser',
    attributes: {
        id: {
            // may come from another system so we want control:
            // not auto-increment, and not necessairly UUID.
            type: DataTypes.STRING,
            allowNull: false,
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
    options: {
        indexes: [
            {
                unique: true,
                fields: ['id', 'clientId']
            }
        ]
    }
}
