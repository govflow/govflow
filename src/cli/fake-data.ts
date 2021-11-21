
import { initConfig } from '../config';
import makeTestData, { writeTestDataToDatabase } from '../tools/fake-data-generator';
import { DatabaseEngine } from '../types';

(async () => {
    const config = await initConfig();
    const { database } = config;
    return writeTestDataToDatabase(database as DatabaseEngine, makeTestData());
})();
