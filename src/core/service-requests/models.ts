import { DataTypes } from 'sequelize';
import { ModelDefinition, ServiceRequestInstance } from '../../types';
import { setPublicIdHook } from './helpers';

export const REQUEST_STATUSES = {
  'inbox': 'Inbox',
  'todo': 'Todo',
  'doing': 'Doing',
  'blocked': 'Blocked',
  'done': 'Done',
  'invalid': 'Invalid',
  'moved': 'Moved',
  'junk': 'Junk'
};

export const SERVICE_REQUEST_CLOSED_STATES = ['done', 'invalid', 'moved', 'junk']

export const REQUEST_STATUS_KEYS = Object.keys(REQUEST_STATUSES);

export const INPUT_CHANNELS = {
  'webform': 'Web Form',
  'bot': 'Bot',
  'sms': 'SMS',
  'email': 'Email',
  'import': 'Import'
}

export const INPUT_CHANNEL_KEYS = Object.keys(INPUT_CHANNELS);

export const COMMUNICATION_CHANNELS = {
  'sms': 'SMS',
  'email': 'Email',
}
export const COMMUNICATION_CHANNEL_KEYS = Object.keys(COMMUNICATION_CHANNELS);

export const ServiceRequestModel: ModelDefinition = {
  name: 'ServiceRequest',
  attributes: {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idCounter: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    inputChannel: {
      allowNull: false,
      type: DataTypes.ENUM(...INPUT_CHANNEL_KEYS),
      defaultValue: INPUT_CHANNEL_KEYS[0],
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    address: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    lat: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    lon: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    images: {
      allowNull: true,
      type: DataTypes.ARRAY(DataTypes.STRING),
      validate: {
        memberURLs(value: string[]) {
          if (!value) return value;
          value.forEach((member: string) => {
            try {
              if (member) { member.split('.').length > 1 }
              // validator.isURL(member);
            } catch (error) {
              throw new Error(`Valid filenames are required for images: ${error}`);
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
      set(value) {
        if (SERVICE_REQUEST_CLOSED_STATES.includes(value as string)) {

          this.setDataValue('closeDate', this.getDataValue('closeDate') || new Date());
        } else {
          this.setDataValue('closeDate', null);
        }
        this.setDataValue('status', value);
      }
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
    phone: {
      allowNull: true,
      type: DataTypes.STRING,
      validate: {
        // isPhone: true TODO: write something like this with libphonenumber
      },
      set(value) {
        if (value === '') { value = null; }
        this.setDataValue('phone', value);
      }
    },
    assignedTo: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    // Fields for Open311 compatibility.
    address_id: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    channel: {
      allowNull: false,
      type: DataTypes.ENUM('email', 'sms', 'anon', 'multiple'),
      defaultValue: 'email',
      set(value) {
        if (!value) {
          const email = this.getDataValue('email');
          const phone = this.getDataValue('phone');
          if (email && phone) {
            value = 'multiple'
          } else if (email) {
            value = 'email';
          } else if (phone) {
            value = 'sms';
          } else {
            value = 'anon';
          }
        }
        this.setDataValue('channel', value);
      }
    },
    closeDate: {
      allowNull: true,
      type: DataTypes.DATE,
      // set(value) {
      //     throw new Error(`The 'closeDate' attribute is not allowed to be directly set: ${value}`);
      // }
    },
    displayName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`;
      },
      set(value) {
        throw new Error(`The 'displayName' attribute is not allowed to be directly set: ${value}`);
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
        unique: true,
        fields: ['publicId', 'jurisdictionId']
      },
      {
        unique: false,
        fields: ['status']
      },
      {
        unique: false,
        fields: ['createdAt']
      },
      {
        unique: false,
        fields: ['updatedAt']
      },
      {
        unique: false,
        fields: ['closeDate']
      }
    ],
    validate: {
      oneOfAddressOrGeometry() {
        if ((this.lat || this.lon === null) && (this.address === null) && (this.address_id === null)) {
          throw new Error('A Service Request requires one of a lat/lon pair, address, or address_id.');
        }
      }
    },
    hooks: {
      beforeSave(instance: ServiceRequestInstance) {
        return setPublicIdHook(instance);
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
      allowNull: true,
    },
    addedBy: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    images: {
      allowNull: true,
      type: DataTypes.ARRAY(DataTypes.STRING),
      validate: {
        memberURLs(value: string[]) {
          if (!value) return value;
          value.forEach((member: string) => {
            try {
              if (member) { member.split('.').length > 1 }
              // validator.isURL(member);
            } catch (error) {
              throw new Error(`Valid filenames are required for images: ${error}`);
            }
          })
          return value;
        }
      }
    },
    broadcastToSubmitter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    broadcastToAssignee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    broadcastToStaff: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isBroadcast: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('broadcastToSubmitter')
          || this.getDataValue('broadcastToAssignee')
          || this.getDataValue('broadcastToStaff');
      },
      set(value) {
        throw new Error(`The 'isBroadcast' attribute is not allowed to be directly set: ${value}`);
      }
    },
  },
  options: {
    freezeTableName: true,
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
        fields: ['addedBy']
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
