import { DataTypes } from 'sequelize';
import { ModelDefinition } from '../../types';

export const ServiceRequestModel: ModelDefinition = {
    name: 'ServiceRequest',
    attributes: {
        description: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        address: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        geometry: {
            allowNull: true,
            type: DataTypes.ARRAY(DataTypes.STRING(2)),
        },
        // Very simple initial state management of requests
        status: {
            allowNull: false,
            type: DataTypes.ENUM('inbox', 'todo', 'doing', 'blocked', 'done'),
            defaultValue: 'inbox',
        },
        // PublicUser attributes. Even when we do support a PublicUser entity and login/etc.
        // We will still probably copy this info over here from that entity.
        first_name: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        last_name: {
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
            validate: { isPhone: true }
        }
    },
    options: {
        validate: {
            oneOfAddressOrGeometry() {
                if ((this.geometry === null) && (this.address === null)) {
                    throw new Error('A Service Request requires one of geometry or address.');
                }
            }
        }
    }
}
