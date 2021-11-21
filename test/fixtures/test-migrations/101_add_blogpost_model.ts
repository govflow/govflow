import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.createTable('BlogPost', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
        },
        content: {
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
    });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.dropTable('BlogPost');
}
