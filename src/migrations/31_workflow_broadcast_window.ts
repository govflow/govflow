import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.addColumn('Jurisdiction', 'workflowBroadcastWindow', {
    allowNull: false,
    defaultValue: 0,
    type: DataTypes.INTEGER,
  });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.removeColumn('Jurisdiction', 'workflowBroadcastWindow');
}
