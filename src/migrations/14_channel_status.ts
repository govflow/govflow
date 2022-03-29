import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

    await queryInterface.createTable('ChannelStatus', {
        id: { // email or phone
            type: DataTypes.STRING,
            primaryKey: true,
        },
        channel: {
            allowNull: false,
            type: DataTypes.ENUM('email', 'phone'),
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        statusLog: { // an array of [event, status] ordered new to old
            type: DataTypes.JSONB,
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
    });
    await queryInterface.removeColumn('ServiceRequest', 'communicationChannelValid');

}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.dropTable('ChannelStatus');
    await queryInterface.addColumn(
        'ServiceRequest',
        'communicationChannelValid',
        {
            type: DataTypes.BOOLEAN,
            defaultValue: null,
            allowNull: true,
        },
    );
}
