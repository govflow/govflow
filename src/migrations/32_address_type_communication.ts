import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.addColumn('Communication', 'address', {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false,
  });
  await queryInterface.addColumn('Communication', 'type', {
    type: DataTypes.ENUM('workflow', 'cx'),
    defaultValue: 'workflow',
    allowNull: false,
  });
  await queryInterface.addIndex('Communication', ['address', 'channel', 'type']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.removeColumn('Communication', 'address');
  await queryInterface.removeColumn('Communication', 'type');
  await queryInterface.removeIndex('Communication', ['address', 'channel', 'type'])
}
