import { QueryInterface, Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';
import logger from '../logging';
import { MigrationPlugin } from '../types';

export function initEngine(database_url: string): Sequelize {
  return new Sequelize(database_url, { logging: false })
}

export function initMigrator(databaseEngine: Sequelize, extraMigrationPaths: MigrationPlugin[] | undefined): Umzug<QueryInterface> {
  let extraPaths = '';
  if (extraMigrationPaths) {
    extraPaths = extraMigrationPaths.join(',');
  }
  const globPattern = `{src/migrations/*.ts,${extraPaths}}`
  return new Umzug({
    migrations: { glob: globPattern },
    context: databaseEngine.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: databaseEngine }),
    logger: logger,
  });
}
