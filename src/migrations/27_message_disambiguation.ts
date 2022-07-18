import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.createTable('MessageDisambiguation', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        submitter_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('open', 'closed'),
            defaultValue: 'open',
        },
        result: {
            allowNull: true,
            type: DataTypes.ENUM('new-request', 'existing-request'),
            defaultValue: 'new-request',
        },
        original_message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        disambiguation_messages: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
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
    // await queryInterface.addIndex('MessageDisambiguation', ['submitter_id']);
    // await queryInterface.addIndex('MessageDisambiguation', ['submitter_id', 'status']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.dropTable('MessageDisambiguation');
    //await queryInterface.removeIndex('MessageDisambiguation', ['submitter_id']);
    //await queryInterface.removeIndex('MessageDisambiguation', ['submitter_id', 'status']);
}
