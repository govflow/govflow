import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.addColumn('Jurisdiction', 'sendFromEmail', {
        allowNull: true,
        type: DataTypes.STRING,
        validate: { isEmail: true }
    });
    await queryInterface.addColumn('Jurisdiction', 'replyToEmail', {
        allowNull: true,
        type: DataTypes.STRING,
        validate: { isEmail: true }
    });
    await queryInterface.addColumn('Jurisdiction', 'address', {
        allowNull: true,
        type: DataTypes.STRING,
    });
    await queryInterface.addColumn('Jurisdiction', 'city', {
        allowNull: true,
        type: DataTypes.STRING,
    });
    await queryInterface.addColumn('Jurisdiction', 'state', {
        allowNull: true,
        type: DataTypes.STRING,
    });
    await queryInterface.addColumn('Jurisdiction', 'country', {
        allowNull: true,
        type: DataTypes.STRING,
    });
    await queryInterface.addColumn('Jurisdiction', 'zip', {
        allowNull: true,
        type: DataTypes.STRING,
    });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.removeColumn('Jurisdiction', 'sendFromEmail');
    await queryInterface.removeColumn('Jurisdiction', 'replyToEmail');
    await queryInterface.removeColumn('Jurisdiction', 'address');
    await queryInterface.removeColumn('Jurisdiction', 'city');
    await queryInterface.removeColumn('Jurisdiction', 'state');
    await queryInterface.removeColumn('Jurisdiction', 'country');
    await queryInterface.removeColumn('Jurisdiction', 'zip');
}
