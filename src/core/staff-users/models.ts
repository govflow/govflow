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
            primaryKey: false,
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
        isAdmin: {
            type: DataTypes.BOOLEAN,
            // TODO: probably need to set this as false, but when we have other permissions logic.
            defaultValue: true,
            allowNull: false,
        },
        displayName: {
            type: DataTypes.VIRTUAL,
            get() {
                return `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`;
            },
            set(value) {
                if (this.getDataValue('firstName') || this.getDataValue('lastnameName')) {
                    return;
                } else {
                    throw new Error(`The 'displayName' attribute is not allowed to be directly set: ${value}`);
                }
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

export const StaffUserDepartmentModel: ModelDefinition = {
    name: 'StaffUserDepartment',
    attributes: {
        isLead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    },
    options: {
        freezeTableName: true,
        indexes: []
    }
}
