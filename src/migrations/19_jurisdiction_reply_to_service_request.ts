import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn('Jurisdiction', 'replyToServiceRequestEnabled', {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
    });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('Jurisdiction', 'replyToServiceRequestEnabled');
}
