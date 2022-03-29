#! /usr/bin/env node
import { createApp } from '..';
import { ServiceRequestInstance } from '../types';

(async () => {
    const app = await createApp();
    const { database } = app;
    const { ServiceRequest, InboundMap } = database.models;
    const records = await ServiceRequest.findAll() as ServiceRequestInstance[];
    for (const record of records) {
        await InboundMap.create({ id: record.id })
    }
})();
