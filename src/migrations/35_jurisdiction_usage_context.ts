import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.addColumn('Jurisdiction', 'usageContext', {
    type: DataTypes.ENUM('311', '911', 'Policing'),
    allowNull: false,
    defaultValue: '311',
  });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.removeColumn('Jurisdiction', 'usageContext');
}
