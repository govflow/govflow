#! /usr/bin/env node
import { createApp } from '..';

(async () => {
    const app = await createApp();
    const { database } = app;
    const { ServiceRequest } = database.models;
    const records = await ServiceRequest.findAll();
    for (const record of records) {
        await record.save()
    }
})();
