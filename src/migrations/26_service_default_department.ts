import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn('Service', 'defaultDepartmentId', {
        type: DataTypes.STRING,
        allowNull: true,
    });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('Service', 'defaultDepartmentId');
}
