import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

    await queryInterface.createTable('Communication', {
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
        dispatched: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        dispatchPayload: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        dispatchResponse: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        accepted: {
            type: DataTypes.BOOLEAN,
            defaultValue: null,
            allowNull: false,
        },
        delivered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
    await queryInterface.addIndex('Communication', ['id', 'serviceRequestId']);
    await queryInterface.addIndex('Communication', ['channel']);
    await queryInterface.addIndex('Communication', ['createdAt']);
    await queryInterface.addIndex('Communication', ['updatedAt']);

    await queryInterface.addColumn(
        'ServiceRequest',
        'communicationChannelValid',
        { type: DataTypes.BOOLEAN, defaultValue: null, allowNull: true, }
    );

}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.dropTable('Communication');
    await queryInterface.removeColumn('ServiceRequest', 'communicationChannelValid');
}
