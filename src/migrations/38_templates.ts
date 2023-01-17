import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {

  await queryInterface.createTable('Template', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    channel: {
      allowNull: false,
      type: DataTypes.ENUM('email', 'sms'),
    },
    name: {
      allowNull: false,
      type: DataTypes.ENUM(
        'cx-survey-public-user',
        'service-request-changed-assignee-staff-user',
        'service-request-changed-status-staff-user',
        'service-request-closed-public-user',
        'service-request-closed-staff-user',
        'service-request-comment-broadcast-public-user',
        'service-request-comment-broadcast-staff-user',
        'service-request-new-public-user',
        'service-request-new-staff-user',
      ),
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM('body', 'subject')
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
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
  await queryInterface.addIndex('Template', ['name']);
  await queryInterface.addIndex('Template', ['name', 'channel', 'jurisdictionId']);

}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.dropTable('Template');
}
