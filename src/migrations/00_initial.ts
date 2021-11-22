import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

    await queryInterface.createTable('Jurisdiction', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
    });

    await queryInterface.createTable('StaffUser', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        permissions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: ['read-contact-info'],
            allowNull: false,
            primaryKey: true,
        },
        firstName: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        lastName: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        phone: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        jurisdictionId: {
            type: DataTypes.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Jurisdiction',
                key: 'id',
            }
        },
    });
    await queryInterface.addIndex('StaffUser', ['id', 'jurisdictionId']);

    await queryInterface.createTable('Service', {
        id: {
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
        type: {
            type: DataTypes.ENUM('realtime', 'batch', 'blackbox'),
            defaultValue: 'realtime',
        },
        metadata: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        extraAttrs: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        parentId: {
            type: DataTypes.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Service',
                key: 'id',
            }
        },
        jurisdictionId: {
            type: DataTypes.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Jurisdiction',
                key: 'id',
            }
        },
    });
    await queryInterface.addIndex('Service', ['name', 'parentId', 'jurisdictionId']);

    await queryInterface.createTable('ServiceRequest', {
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
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('inbox', 'todo', 'doing', 'blocked', 'done'),
            defaultValue: 'inbox',
        },
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
        },
        phone: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        address_id: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        assignedTo: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        serviceId: {
            type: DataTypes.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Service',
                key: 'id',
            }
        },
        jurisdictionId: {
            type: DataTypes.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Jurisdiction',
                key: 'id',
            }
        },
    });
    await queryInterface.addIndex('ServiceRequest', ['id', 'jurisdictionId']);
    await queryInterface.addIndex('ServiceRequest', ['status']);

    await queryInterface.createTable('ServiceRequestComment', {
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
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        serviceRequestId: {
            type: DataTypes.UUID,
            onDelete: 'CASCADE',
            references: {
                model: 'ServiceRequest',
                key: 'id',
            }
        },
    });
    await queryInterface.addIndex('ServiceRequestComment', ['id', 'serviceRequestId']);
    await queryInterface.addIndex('ServiceRequestComment', ['serviceRequestId']);
    await queryInterface.addIndex('ServiceRequestComment', ['createdAt']);
    await queryInterface.addIndex('ServiceRequestComment', ['updatedAt']);

    await queryInterface.createTable('Event', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        sender: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        actor: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        jurisdictionId: {
            type: DataTypes.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Jurisdiction',
                key: 'id',
            }
        },
    });
    await queryInterface.addIndex('Event', ['createdAt']);
    await queryInterface.addIndex('Event', ['updatedAt']);

}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

    await queryInterface.dropTable('Jurisdiction');
    await queryInterface.dropTable('StaffUser');
    await queryInterface.dropTable('Service');
    await queryInterface.dropTable('ServiceRequest');
    await queryInterface.dropTable('ServiceRequestComment');
    await queryInterface.dropTable('Event');

}
