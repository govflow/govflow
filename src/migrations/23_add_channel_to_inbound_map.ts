import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn('InboundMap', 'channel', {
        type: DataTypes.ENUM('email', 'sms'),
        allowNull: false,
        defaultValue: 'email',
    });
    await queryInterface.addIndex('InboundMap', ['id', 'channel']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('InboundMap', 'channel');
    await queryInterface.removeIndex('InboundMap', ['id', 'channel']);
}
