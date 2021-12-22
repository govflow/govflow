import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

    await queryInterface.createTable('Department', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        primaryContactName: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        primaryContactEmail: {
            allowNull: true,
            type: DataTypes.STRING,
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
    });
    await queryInterface.addIndex('Department', ['id', 'jurisdictionId']);
    await queryInterface.addIndex('Department', ['jurisdictionId']);
    await queryInterface.addIndex('Department', ['createdAt']);
    await queryInterface.addIndex('Department', ['updatedAt']);

    await queryInterface.addColumn(
        'ServiceRequest',
        'departmentId',
        {
            type: DataTypes.UUID,
            allowNull: true,
            onDelete: 'SET NULL',
            references: {
                model: 'Department',
                key: 'id',
            }
        }
    );
    await queryInterface.addIndex('ServiceRequest', ['departmentId']);

}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.dropTable('Department');
    await queryInterface.removeColumn('ServiceRequest', 'departmentId');
}
