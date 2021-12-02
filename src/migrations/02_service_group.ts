import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('Service', 'parentId');
    await queryInterface.addColumn(
        'Service',
        'group',
        { allowNull: false, type: DataTypes.STRING, }
    );
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('Service', 'group');
    await queryInterface.addColumn(
      'Service',
      'parentId',
      {
          type: DataTypes.STRING,
          onDelete: 'CASCADE',
          references: {
              model: 'Service',
              key: 'id',
          }
      }
    );
}
