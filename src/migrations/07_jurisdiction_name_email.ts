import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn('Jurisdiction', 'name', { allowNull: true, type: DataTypes.STRING });
    await queryInterface.addColumn('Jurisdiction', 'email', { allowNull: true, type: DataTypes.STRING });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('Jurisdiction', 'name');
    await queryInterface.removeColumn('Jurisdiction', 'email');
}
