import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.addColumn('Jurisdiction', 'workflowEnabled', {
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN,
  });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.removeColumn('Jurisdiction', 'workflowEnabled');
}
