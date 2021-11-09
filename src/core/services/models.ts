import _ from 'lodash';
import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';
import { isValidToSchema, serviceExtraAttrsSchema } from '../schemas';

const validExtras = isValidToSchema(serviceExtraAttrsSchema);

const ServiceModel: ModelDefinition = {
    name: 'Service',
    attributes: {
        id: {
            // id could be uuid or could be any string
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        description: {
            allowNull: true,
            type: DataTypes.TEXT,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        type: { // Comes from Open311 spec but generally useful
            type: DataTypes.ENUM('realtime', 'batch', 'blackbox'),
            defaultValue: 'realtime',
        },
        metadata: { // Open311
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        extraAttrs: { // Open311
            type: DataTypes.JSONB,
            allowNull: true,
            validate: {
                validExtras
            }
        },
        // Virtual fields for Open311 compatibility.
        service_code: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('id');
            },
            set(value) {
                this.setDataValue('id', value);
            }
        },
        service_name: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('name');
            },
            set(value) {
                this.setDataValue('name', value);
            }
        },
        group: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('parentId');
            },
            set(value) {
                throw new Error(`The 'group' attribute is not allowed to be directly set: ${value}`);
            }
        },
        keywords: {
            type: DataTypes.VIRTUAL,
            get() {
                let value = null;
                const tags = this.getDataValue('tags');
                if (!_.isNil(tags)) {
                    value = this.getDataValue('tags').join(',')
                }
                return value;
            },
            set(value) {
                if (typeof value === "string") {
                    value = value.replaceAll(' ', '').split(',')
                }
                this.setDataValue('tags', value);
            }
        },
    },
    options: {
        indexes: [{ unique: true, fields: ['name', 'parentId', 'clientId'] }]
    }
}

export {
    ServiceModel
};
