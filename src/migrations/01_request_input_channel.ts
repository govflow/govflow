import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn(
        'ServiceRequest',
        'inputChannel',
        { type: DataTypes.ENUM('webform', 'bot', 'sms', 'email'), defaultValue: 'webform', }
    );
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequest', 'inputChannel')
}
