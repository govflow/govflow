import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.addColumn('Jurisdiction', 'cxDataSource', {
    type: DataTypes.ENUM('OrganicDataItem', 'CivicPlusSeeClickFix', 'CivicPlusRequestTracker', 'Lucity'),
    allowNull: false,
    defaultValue: 'OrganicDataItem',
  });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.removeColumn('Jurisdiction', 'cxDataSource');
}
