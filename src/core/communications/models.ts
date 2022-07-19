import { DataTypes } from 'sequelize';
import validator from 'validator';
import type { ModelDefinition } from '../../types';

export const SMS_EVENT_MAP = {
    'accepted': null,
    'queued': null,
    'sending': null,
    'receiving': null,
    'received': null,
    'canceled': null,
    'failed': false,
    'undelivered': false,
    'sent': true,
    'delivered': true,
    'read': true, // whatapp only
} as Record<string, boolean | null>;

export const SMS_EVENT_MAP_KEYS = Object.keys(SMS_EVENT_MAP);

export const EMAIL_EVENT_MAP = {
    'processed': null, // Message has been received and is ready to be delivered.
    'deferred': null, // Receiving server temporarily rejected the message.
    'delivered': true, // Message has been successfully delivered to the receiving server.
    'bounce': false, // Receiving server could not or would not accept mail to this recipient permanently. If a recipient has previously unsubscribed from your emails, the message is dropped.
    'blocked': false, // Receiving server could not or would not accept the message temporarily. If a recipient has previously unsubscribed from your emails, the message is dropped.
    'dropped': false, // You may see the following drop reasons: Invalid SMTPAPI header, Spam Content (if Spam Checker app is enabled), Unsubscribed Address, Bounced Address, Spam Reporting Address, Invalid, Recipient List over Package Quota
    'spamreport': false, // Recipient marked message as spam.
    'unsubscribe': false, // Recipient clicked on the 'Opt Out of All Emails' link (available after clicking the message's subscription management link). Subscription Tracking needs to be enabled for this type of event.
    'group_unsubscribe': false, // Recipient unsubscribed from a specific group either by clicking the link directly or updating their preferences. Subscription Tracking needs to be enabled for this type of event.
    'group_resubscribe': true, // Recipient resubscribed to a specific group by updating their preferences. Subscription Tracking needs to be enabled for this type of event.
    'open': null, // Recipient has opened the HTML message. Open Tracking needs to be enabled for this type of event.
    'click': null, // Recipient clicked on a link within the message. Click Tracking needs to be enabled for this type of event.
} as Record<string, boolean | null>;

export const EMAIL_EVENT_IGNORE = ['processed', 'deferred', 'open', 'clicked']

export const EMAIL_EVENT_MAP_KEYS = Object.keys(EMAIL_EVENT_MAP);

export const MESSAGE_DISAMBIGUATION_STATUS_KEYS = [
    'open',
    'closed'
]

export const MESSAGE_DISAMBIGUATION_RESULT_KEYS = [
    'new-request',
    'existing-request'
]

export const CommunicationModel: ModelDefinition = {
    name: 'Communication',
    attributes: {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        channel: {
            allowNull: false,
            type: DataTypes.ENUM('email', 'sms'),
        },
        // has the payload been sent to the provider
        dispatched: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        // what payload was sent to the provider
        dispatchPayload: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        // what response the provider gave for our dispatch
        dispatchResponse: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        // did the provider accept our payload?
        // if the provider did not respond with an SID, or a 202 status code,
        // or possibly other response data that indicates they have accepted our payload
        // then, accepted will be false.
        // reasons for that could be invalid account credentials, an invalid payload,
        // or specifically, an invalid communication address (i.e.: email or phone provided is not valid).
        // Also if the request simply fails then accepted will be false.
        // TODO: In future we probably need to handle these various possible states with more granularity.
        accepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: null,
            allowNull: false,
        },
        // TODO: Check after dispatch with the backends and verify delivery.
        // For now, we set delivered to true with a successful dispatch, but with
        // some communication backends, like twilio SMS, the dispatch really means
        //it has been queued and is pending for delivery and we can poll later to
        // check actual delivery.
        delivered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
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
                fields: ['channel']
            },
            {
                unique: false,
                fields: ['createdAt']
            },
            {
                unique: false,
                fields: ['updatedAt']
            },
        ]
    }
}

export const InboundMapModel: ModelDefinition = {
    name: 'InboundMap',
    attributes: {
        id: {
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        channel: {
            type: DataTypes.ENUM('email', 'sms'),
            allowNull: false,
            defaultValue: 'email',
        },
        staffUserId: { // is not a foreignKey as commonly customised
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    options: {
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['id', 'jurisdictionId', 'departmentId']
            },
            {
                unique: true,
                fields: ['id', 'jurisdictionId', 'departmentId', 'staffUserId']
            },
            {
                unique: true,
                fields: ['id', 'jurisdictionId', 'departmentId', 'serviceId']
            },
            {
                unique: true,
                fields: ['id', 'jurisdictionId', 'staffUserId']
            },
            {
                unique: true,
                fields: ['id', 'jurisdictionId', 'serviceId']
            },
            {
                unique: true,
                fields: ['id', 'jurisdictionId', 'serviceRequestId']
            },
            {
                unique: true,
                fields: ['id', 'channel', 'jurisdictionId']
            }
        ]
    }
}

export const ChannelStatusModel: ModelDefinition = {
    name: 'ChannelStatus',
    attributes: {
        id: { // email or phone
            type: DataTypes.STRING,
            primaryKey: true,
        },
        channel: {
            allowNull: false,
            type: DataTypes.ENUM('email', 'phone'),
        },
        isAllowed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        log: { // an array of [event, status] ordered new to old
            type: DataTypes.JSONB,
            allowNull: false,
        },
    },
    options: {
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['id', 'channel']
            },
            {
                unique: false,
                fields: ['channel']
            }
        ],
        validate: {
            oneOfEmailOrPhone() {
                if (this.channel === 'email') {
                    try {
                        validator.isEmail(this.id as string);
                    } catch {
                        throw new Error(`${this.id} is not a validate email.`);
                    }
                } else if (this.channel === 'phone') {
                    // TODO: validate phone when we can
                }
            }
        }
    }
}

export const MessageDisambiguationModel: ModelDefinition = {
    name: 'MessageDisambiguation',
    attributes: {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        submitterId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM(...MESSAGE_DISAMBIGUATION_STATUS_KEYS),
            defaultValue: MESSAGE_DISAMBIGUATION_STATUS_KEYS[0],
        },
        result: {
            allowNull: true,
            type: DataTypes.ENUM(...MESSAGE_DISAMBIGUATION_RESULT_KEYS),
            defaultValue: MESSAGE_DISAMBIGUATION_RESULT_KEYS[0],
        },
        originalMessage: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        disambiguationFlow: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
        },
        choiceMap: {
            type: DataTypes.JSONB,
            allowNull: true,
        }
    },
    options: {
        freezeTableName: true,
        indexes: [
            {
                unique: true,
                fields: ['submitterId']
            },
            {
                unique: true,
                fields: ['submitterId', 'status']
            },
        ]
    }
}
