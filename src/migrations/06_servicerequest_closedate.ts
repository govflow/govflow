import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn(
        'ServiceRequest',
        'closeDate',
        { allowNull: true, type: DataTypes.DATE }
    );
    await queryInterface.addIndex('ServiceRequest', ['closeDate']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequest', 'closeDate');
    await queryInterface.removeIndex('ServiceRequest', ['closeDate'])
}
