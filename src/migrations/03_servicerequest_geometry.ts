import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequest', 'geometry');
    await queryInterface.addColumn(
        'ServiceRequest',
        'lat',
        { allowNull: false, type: DataTypes.FLOAT, defaultValue: 0 }
    );
    await queryInterface.addColumn(
        'ServiceRequest',
        'lon',
        { allowNull: false, type: DataTypes.FLOAT, defaultValue: 0 }
    );
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequest', 'lat');
    await queryInterface.removeColumn('ServiceRequest', 'lon');
    await queryInterface.addColumn(
        'ServiceRequest',
        'geometry',
        { allowNull: false, type: DataTypes.ARRAY(DataTypes.STRING(2)), }
    );
}
