import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn('ServiceRequestComment', 'broadcastToSubmitter', {
        allowNull: false,
        type: DataTypes.BOOLEAN,
    });
    await queryInterface.addColumn('ServiceRequestComment', 'broadcastToAssignee', {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
    });
    await queryInterface.addColumn('ServiceRequestComment', 'broadcastToStaff', {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN,
    });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequestComment', 'broadcastToSubmitter');
    await queryInterface.removeColumn('ServiceRequestComment', 'broadcastToAssignee');
    await queryInterface.removeColumn('ServiceRequestComment', 'broadcastToStaff');
}
