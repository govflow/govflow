import { DataTypes } from 'sequelize';
import validator from 'validator';
import { ModelDefinition } from '../../types';

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
            type: DataTypes.ENUM('inbox', 'todo', 'doing', 'blocked', 'done'),
            defaultValue: 'inbox',
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
                if ((this.geometry === null) && (this.address === null)) {
                    throw new Error('A Service Request requires one of geometry or address.');
                }
            }
        }
    }
}

export const ServiceRequestCommentModel: ModelDefinition = {
    name: 'ServiceRequestComment',
    attributes: {
        comment: {
            type: DataTypes.STRING,
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
            }
        ]
    }
}
