import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.createTable('InboundMap', {
        id: {
            type: DataTypes.STRING,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        jurisdictionId: {
            type: DataTypes.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Jurisdiction',
                key: 'id',
            }
        },
        departmentId: {
            type: DataTypes.UUID,
            onDelete: 'CASCADE',
            references: {
                model: 'Department',
                key: 'id',
            }
        },
    });
    await queryInterface.addIndex('InboundMap', ['id', 'jurisdictionId', 'departmentId']);
    await queryInterface.addIndex('InboundMap', ['createdAt']);
    await queryInterface.addIndex('InboundMap', ['updatedAt']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.dropTable('InboundMap');
}
