import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.addColumn(
    'Jurisdiction',
    'preferredBroadcastChannel',
    { type: DataTypes.ENUM('email', 'sms'), defaultValue: 'email', }
  );
  await queryInterface.sequelize.query(`ALTER TYPE "enum_ServiceRequest_channel" ADD VALUE 'multiple'`);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.removeColumn('Jurisdiction', 'preferredBroadcastChannel')
}
