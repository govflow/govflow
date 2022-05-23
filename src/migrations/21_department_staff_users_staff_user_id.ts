import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

    // this is fixing an unintended constraint which
    // prevented the new migration from working.
    // await queryInterface.removeConstraint('StaffUser', 'StaffUser_pkey');
    // await queryInterface.sequelize.query('ALTER TABLE "StaffUser" ADD PRIMARY KEY (id)');

    await queryInterface.removeColumn('StaffUserDepartment', 'staffUserId');

    await queryInterface.addColumn(
        'StaffUserDepartment',
        'staffUserId',
        {
            allowNull: false,
            type: DataTypes.STRING,
            primaryKey: true,
        },
    );

    await queryInterface.removeColumn('StaffUserDepartment', 'departmentId');

    await queryInterface.addColumn(
        'StaffUserDepartment',
        'departmentId',
        {
            allowNull: false,
            type: DataTypes.STRING,
            primaryKey: true,
        },
    );

}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('StaffUserDepartment', 'staffUserId');
    await queryInterface.addColumn(
        'StaffUserDepartment',
        'staffUserId',
        {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            onDelete: 'SET NULL',
            references: {
                model: 'StaffUser',
                key: 'id',
            }
        },
    );
    await queryInterface.removeColumn('StaffUserDepartment', 'departmentId');
    await queryInterface.addColumn(
        'StaffUserDepartment',
        'departmentId',
        {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            onDelete: 'SET NULL',
            references: {
                model: 'Department',
                key: 'id',
            }
        },
    );
}
