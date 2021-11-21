import { QueryInterface, Sequelize } from 'sequelize';
import { SequelizeStorage, Umzug } from 'umzug';
import logger from '../logging';

export function initEngine(database_url: string): Sequelize {
    return new Sequelize(database_url, { logging: msg => logger.info(msg), })
}

export function initMigrator(databaseEngine: Sequelize, extraMigrationPaths = ''): Umzug<QueryInterface> {
    const globPattern = `{src/migrations/*.ts,${extraMigrationPaths}}`
    return new Umzug({
        migrations: { glob: globPattern },
        context: databaseEngine.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize: databaseEngine }),
        logger: logger,
    });
}
