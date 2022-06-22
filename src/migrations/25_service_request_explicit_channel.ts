import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn('ServiceRequest', 'channel', {
        type: DataTypes.ENUM('email', 'sms'),
        allowNull: false,
        defaultValue: 'email',
    });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequest', 'channel');
}
