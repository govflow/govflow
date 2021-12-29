import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn(
        'StaffUser',
        'isAdmin',
        { allowNull: false, type: DataTypes.BOOLEAN, defaultValue: true }
    );
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('StaffUser', 'isAdmin');
}
