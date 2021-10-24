import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../src/types';

const MyServiceModel: ModelDefinition = {
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
