import type { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';

export async function up({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.addColumn('Jurisdiction', 'cxSurveyEnabled', {
    allowNull: false,
    defaultValue: false,
    type: DataTypes.BOOLEAN,
  });
  await queryInterface.addColumn('Jurisdiction', 'cxSurveyUrl', {
    allowNull: true,
    type: DataTypes.STRING,
  });
  await queryInterface.addColumn('Jurisdiction', 'cxSurveyBroadcastWindow', {
    allowNull: false,
    defaultValue: 24,
    type: DataTypes.INTEGER,
  });
  await queryInterface.addColumn('Jurisdiction', 'cxSurveyTriggerStatus', {
    allowNull: false,
    defaultValue: 'done',
    type: DataTypes.ENUM('inbox', 'todo', 'doing', 'blocked', 'done', 'invalid', 'moved'),
  });
}

export async function down({ context: queryInterface }: Record<string, QueryInterface>): Promise<void> {
  await queryInterface.removeColumn('Jurisdiction', 'cxSurveyEnabled');
  await queryInterface.removeColumn('Jurisdiction', 'cxSurveyUrl');
  await queryInterface.removeColumn('Jurisdiction', 'cxSurveyBroadcastWindow');
  await queryInterface.removeColumn('Jurisdiction', 'cxSurveyTriggerStatus');
}
