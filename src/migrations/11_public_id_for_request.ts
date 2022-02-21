import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn(
        'ServiceRequest',
        'publicId',
        { type: DataTypes.STRING, allowNull: false }
    );
    await queryInterface.addColumn(
        'ServiceRequest',
        'idCounter',
        { type: DataTypes.INTEGER, allowNull: false }
    );
    await queryInterface.addIndex('ServiceRequest', ['jurisdictionId', 'publicId']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequest', 'publicId');
    await queryInterface.removeColumn('ServiceRequest', 'idCounter');
    await queryInterface.removeIndex('ServiceRequest', ['jurisdictionId', 'publicId'])
}
