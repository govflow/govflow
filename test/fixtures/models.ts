import { DataTypes } from 'sequelize';
import type { ModelDefinition } from '../../src/types';

export const MyServiceModel: ModelDefinition = {
    name: 'Service',
    attributes: {
        id: {
            allowNull: false,
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        description: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        internal_comments: {
            allowNull: true,
            type: DataTypes.STRING,
        },
    },
    options: {
        indexes: [{ unique: true, fields: ['name', 'parentId'] }]
    }
}

export const MyBlogPostModel: ModelDefinition = {
    name: 'BlogPost',
    attributes: {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
        },
        content: {
            allowNull: true,
            type: DataTypes.STRING,
        },
    }
}
