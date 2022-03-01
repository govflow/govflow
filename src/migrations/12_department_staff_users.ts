import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

    // this is fixing an unintended constraint which
    // prevented the new migration from working.
    await queryInterface.removeConstraint('StaffUser', 'StaffUser_pkey');
    await queryInterface.sequelize.query('ALTER TABLE "StaffUser" ADD PRIMARY KEY (id)');

    await queryInterface.createTable('StaffUserDepartment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        staffUserId: {
            type: DataTypes.STRING,
            allowNull: false,
            onDelete: 'SET NULL',
            references: {
                model: 'StaffUser',
                key: 'id',
            }
        },
        departmentId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            onDelete: 'SET NULL',
            references: {
                model: 'Department',
                key: 'id',
            }
        },
        isLead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    });

    await queryInterface.addColumn(
        'Jurisdiction',
        'enforceAssignmentThroughDepartment',
        {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    );
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('Jurisdiction', 'enforceAssignmentThroughDepartment');
    await queryInterface.dropTable('StaffUserDepartment');
}
