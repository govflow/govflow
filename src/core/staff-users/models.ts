import { DataTypes } from 'sequelize';
import type { ModelDefinition } from '../../types';

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
        },
        displayName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`;
            },
            set(value) {
                throw new Error(`The 'displayName' attribute is not allowed to be directly set: ${value}`);
            }
        },
    },
    options: {
        indexes: [
            {
                unique: true,
                fields: ['id', 'jurisdictionId']
            }
        ]
    }
}
