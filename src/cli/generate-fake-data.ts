#! /usr/bin/env node
import 'reflect-metadata';
import { createApp } from '../index';
import makeTestData, { writeTestDataToDatabase } from '../tools/fake-data-generator';
import { DatabaseEngine } from '../types';

(async () => {
    const app = await createApp();
    const { database } = app;
    return writeTestDataToDatabase(database as DatabaseEngine, makeTestData());
})();
