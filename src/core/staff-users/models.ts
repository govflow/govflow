import { DataTypes } from 'sequelize';
import type { ModelDefinition } from '../../types';

export const ADMIN_USER_PERMISSIONS = [
    'access-all-jurisdictions',
]

export const STAFF_USER_PERMISSIONS = [
    'read-contact-info',
]

export const PERMISSIONS = [
    ...STAFF_USER_PERMISSIONS,
    ...ADMIN_USER_PERMISSIONS,
]

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
        permissions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: STAFF_USER_PERMISSIONS,
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
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['id', 'jurisdictionId']
            }
        ]
    }
}
