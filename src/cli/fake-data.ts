
import { databaseEngine } from '../db';
import { createApp } from '../index';
import makeTestData, { writeTestDataToDatabase } from '../tools/fake-data-generator';

// dodgy, but we need it as the database is constructed as a side effect at present.
// this also means that this only works without plugins.
// this file could be copied and run with plugins etc. to get around that in specific cases.
(async () => { return await createApp(); })();

(async () => { return writeTestDataToDatabase(databaseEngine, makeTestData()); })();
