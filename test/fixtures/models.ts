import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../src/types';

const MyServiceModel: ModelDefinition = {
    name: 'Service',
    attributes: {
        code: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },
        clientId: {
            allowNull: false,
            type: DataTypes.STRING,
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
        indexes: [{ unique: true, fields: ['name', 'parentId', 'clientId'] }]
    }
}

const MyBlogPostModel: ModelDefinition = {
    name: 'BlogPost',
    attributes: {
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

export {
    MyServiceModel,
    MyBlogPostModel
};
