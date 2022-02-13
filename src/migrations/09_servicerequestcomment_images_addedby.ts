import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn(
        'ServiceRequestComment',
        'images',
        { allowNull: true, type: DataTypes.ARRAY(DataTypes.STRING) }
    );
    await queryInterface.addColumn(
        'ServiceRequestComment',
        'addedBy',
        { allowNull: true, type: DataTypes.STRING }
    );
    await queryInterface.changeColumn(
        'ServiceRequestComment',
        'comment',
        { allowNull: true, type: DataTypes.TEXT }
    );
    await queryInterface.addIndex('ServiceRequestComment', ['addedBy']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('ServiceRequestComment', 'addedBy');
    await queryInterface.removeColumn('ServiceRequestComment', 'images');
    await queryInterface.changeColumn(
        'ServiceRequestComment',
        'comment',
        { allowNull: false, type: DataTypes.TEXT }
    );
    await queryInterface.removeIndex('ServiceRequestComment', ['addedBy'])
}
