import { DataTypes } from 'sequelize';
import { Model } from '../../src/types';

const MyServiceModel: Model = {
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

const MyBlogPostModel: Model = {
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
