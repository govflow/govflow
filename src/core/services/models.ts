import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';
import { isValidToSchema, serviceExtraAttrsSchema } from './schemas';

const validExtras = isValidToSchema(serviceExtraAttrsSchema);

const ServiceModel: ModelDefinition = {
    name: 'Service',
    attributes: {
        id: {
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
        metadata: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        type: {
            type: DataTypes.ENUM('realtime', 'batch', 'blackbox'),
            defaultValue: 'realtime',
        },
        keywords: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            set(value) {
                if (typeof value === "string") {
                    // assume a comma-seperated string of keywords
                    // e.g. this is what we get from open311 payload
                    value = value.replaceAll(' ', '').split(',')
                }
                this.setDataValue('keywords', value);
            }
        },
        extraAttrs: {
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
                /* eslint-disable */
                // @ts-ignore
                return this.id;
                /* eslint-enable */
            },
            set(value) {
                this.setDataValue('id', value);
            }
        },
        service_name: {
            type: DataTypes.VIRTUAL,
            get() {
                /* eslint-disable */
                // @ts-ignore
                const value = this.name
                /* eslint-enable */
                return value;
            },
            set(value) {
                this.setDataValue('name', value);
            }
        },
        group: {
            type: DataTypes.VIRTUAL,
            get() {
                /* eslint-disable */
                // @ts-ignore
                let group = this.parent.name;
                /* eslint-enable */
                return group;
            },
            set(value) {
                value;
                throw new Error('The `group` attribute is not allowed to be directly set.');
            }
        }
    },
    options: {
        indexes: [{ unique: true, fields: ['name', 'parentId', 'clientId'] }]
    }
}

export {
    ServiceModel
};
