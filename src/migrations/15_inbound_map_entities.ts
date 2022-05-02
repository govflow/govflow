import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn('InboundMap', 'staffUserId', {
        type: DataTypes.STRING,
        allowNull: true,
    });
    await queryInterface.addColumn('InboundMap', 'serviceRequestId', {
        type: DataTypes.UUID,
        onDelete: 'SET NULL',
        references: {
            model: 'ServiceRequest',
            key: 'id',
        }
    });
    await queryInterface.addColumn('InboundMap', 'serviceId', {
        type: DataTypes.STRING,
        onDelete: 'SET NULL',
        references: {
            model: 'Service',
            key: 'id',
        }
    });
    await queryInterface.addIndex('InboundMap', ['id', 'jurisdictionId', 'departmentId', 'staffUserId']);
    await queryInterface.addIndex('InboundMap', ['id', 'jurisdictionId', 'departmentId', 'serviceId']);
    await queryInterface.addIndex('InboundMap', ['id', 'jurisdictionId', 'staffUserId']);
    await queryInterface.addIndex('InboundMap', ['id', 'jurisdictionId', 'serviceId']);
    await queryInterface.addIndex('InboundMap', ['id', 'jurisdictionId', 'serviceRequestId']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('InboundMap', 'serviceRequestId');
    await queryInterface.removeColumn('InboundMap', 'serviceId');
    await queryInterface.removeColumn('InboundMap', 'staffUserId');
}
