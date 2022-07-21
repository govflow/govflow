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
        submitterId: {
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
        originalMessage: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        disambiguationFlow: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
        },
        choiceMap: {
            type: DataTypes.JSONB,
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
        jurisdictionId: {
            type: DataTypes.STRING,
            onDelete: 'CASCADE',
            references: {
                model: 'Jurisdiction',
                key: 'id',
            }
        },
    });
    await queryInterface.addIndex('MessageDisambiguation', ['submitterId']);
    await queryInterface.addIndex('MessageDisambiguation', ['submitterId', 'status']);
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
    await queryInterface.dropTable('MessageDisambiguation');
}
