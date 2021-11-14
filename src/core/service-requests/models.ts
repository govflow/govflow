import { DataTypes } from 'sequelize';
import validator from 'validator';
import { ModelDefinition } from '../../types';

export const REQUEST_STATUSES = {
    'inbox': 'Inbox',
    'todo': 'Todo',
    'doing': 'Doing',
    'blocked': 'Blocked',
    'done': 'Done'

};

const REQUEST_STATUS_KEYS = Object.keys(REQUEST_STATUSES);

export const ServiceRequestModel: ModelDefinition = {
    name: 'ServiceRequest',
    attributes: {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        description: {
            allowNull: false,
            type: DataTypes.TEXT,
        },
        address: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        geometry: {
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING(2)),
        },
        images: {
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING),
            validate: {
                memberURLs(value: string[]) {
                    if (!value) return value;
                    value.forEach((member: string) => {
                        try {
                            validator.isURL(member);
                        } catch (error) {
                            throw new Error(`Valid URLs are required for images: ${error}`);
                        }
                    })
                    return value;
                }
            }
        },
        // Very simple initial state management of requests
        status: {
            allowNull: false,
            type: DataTypes.ENUM(...REQUEST_STATUS_KEYS),
            defaultValue: REQUEST_STATUS_KEYS[0],
        },
        // PublicUser attributes. Even when we do support a PublicUser entity and login/etc.
        // We will still probably copy this info over here from that entity.
        firstName: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        lastName: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        device: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        email: {
            allowNull: true,
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
        // Fields for Open311 compatibility.
        address_id: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        first_name: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('firstName');
            },
            set(value) {
                this.setDataValue('firstName', value);
            }
        },
        last_name: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('lastName');
            },
            set(value) {
                this.setDataValue('lastName', value);
            }
        },
        service_code: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('serviceId');
            },
            set(value) {
                this.setDataValue('serviceId', value);
            }
        },
        media_url: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('images')[0];
            },
            set(value) {
                this.setDataValue('images', [value]);
            }
        },
    },
    options: {
        indexes: [
            {
                unique: true,
                fields: ['id', 'clientId']
            },
            {
                unique: false,
                fields: ['status']
            }
        ],
        validate: {
            oneOfAddressOrGeometry() {
                if ((this.geometry === null) && (this.address === null) && (this.address_id === null)) {
                    throw new Error('A Service Request requires one of geometry, address, or address_id.');
                }
            }
        }
    }
}

export const ServiceRequestCommentModel: ModelDefinition = {
    name: 'ServiceRequestComment',
    attributes: {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    options: {
        indexes: [
            {
                unique: true,
                fields: ['id', 'serviceRequestId']
            },
            {
                unique: false,
                fields: ['serviceRequestId']
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
