import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.dropTable('Event');
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
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
