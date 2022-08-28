import { DataTypes } from 'sequelize';
import type { ModelDefinition } from '../../types';

export const DepartmentModel: ModelDefinition = {
    name: 'Department',
    attributes: {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        primaryContactName: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        primaryContactEmail: {
            allowNull: true,
            type: DataTypes.STRING,
            validate: { isEmail: true },
            set(value) {
                if (value === '') {
                    value = null;
                } else if (typeof value === 'string') {
                    value = value.toLowerCase();
                }
                this.setDataValue('email', value);
            }
        },
    },
    options: {
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['id', 'jurisdictionId']
            },
            {
                unique: false,
                fields: ['jurisdictionId']
            },
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