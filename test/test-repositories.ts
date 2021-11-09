import chai from 'chai';
import type { Application } from 'express';
import { createApp } from '../src/index';
import makeTestData from './fixtures/data';
import { validServiceData } from './fixtures/open311';

describe('Verify Core Repositories.', function () {

    let app: Application;
    let testData: Record<string, Record<string, unknown>[]>;

    before(async function () {
        app = await createApp();
        testData = makeTestData();
    })

    after(async function () {
        await app.database.drop({});
    })

    it('should find all repositories', async function () {
        const { Service, Client, StaffUser, ServiceRequest, Event } = app.repositories;
        chai.assert(Client);
        chai.assert(StaffUser);
        chai.assert(Event);
        chai.assert(ServiceRequest);
        chai.assert(Service);
    });

    it('should write clients via repository', async function () {
        const { Client } = app.repositories;
        for (const clientData of testData.clients) {
            let record = await Client.create(clientData);
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, clientData.jurisdictionId);
            chai.assert.equal(record.id, clientData.id);
        }
    });

    it('should find clients by id via repository', async function () {
        const { Client } = app.repositories;
        for (const clientData of testData.clients) {
            let record = await Client.findOne(clientData.id);
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, clientData.jurisdictionId);
        }
    });

    it('should find clients by jurisdictionId via repository', async function () {
        const { Client } = app.repositories;
        for (const clientData of testData.clients) {
            let record = await Client.findOneByJurisdiction(clientData.jurisdictionId);
            chai.assert(record);
            chai.assert.equal(record.id, clientData.id);
        }
    });

    it('should write staff users via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            let record = await StaffUser.create(staffUserData);
            chai.assert(record);
            chai.assert.equal(record.clientId, staffUserData.clientId);
            chai.assert.equal(record.email, staffUserData.email);
        }
    });

    it('should find one staff user by client via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            let record = await StaffUser.findOne(staffUserData.clientId, staffUserData.id);
            chai.assert(record);
            chai.assert.equal(record.clientId, staffUserData.clientId);
        }
    });

    it('should find all staff users by client via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const clientData of testData.staffUsers) {
            let [records, recordCount] = await StaffUser.findAll(clientData.id);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.clientId, clientData.clientId);
            }
        }
    });

    it('should write services via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            let record = await Service.create(serviceData);
            chai.assert(record);
            chai.assert.equal(record.clientId, serviceData.clientId);
            chai.assert.equal(record.name, serviceData.name);
        }
    });

    it('should write Open311 services via repository', async function () {
        const { Open311Service, Client } = app.repositories;
        const client = await Client.findOne(testData.clients[2].id);
        const jurisdictionId = testData.clients[0].jurisdictionId
        for (const serviceData of validServiceData) {
            let record = await Open311Service.create(Object.assign({}, serviceData, { jurisdictionId }));
            chai.assert(record);
            chai.assert.equal(record.service_code, serviceData.service_code);
            chai.assert.equal(record.service_name, serviceData.service_name);
        }
    });

    it('should find one service by client via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            let record = await Service.findOne(serviceData.clientId, serviceData.id);
            chai.assert(record);
            chai.assert.equal(record.id, serviceData.id);
            chai.assert.equal(record.clientId, serviceData.clientId);
        }
    });

    it('should find all services by client via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            let [records, recordCount] = await Service.findAll(serviceData.clientId, false);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.clientId, serviceData.clientId);
            }
        }
    });

    it('should write service requests via repository', async function () {
        const { ServiceRequest } = app.database.models;
        for (const serviceRequestData of testData.serviceRequests) {
            let record = await ServiceRequest.create(serviceRequestData);
            chai.assert(record);
        }
    });

    it('should find one service request by client via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            let record = await ServiceRequest.findOne(serviceRequestData.clientId, serviceRequestData.id);
            chai.assert(record);
            chai.assert.equal(record.id, serviceRequestData.id);
            chai.assert.equal(record.clientId, serviceRequestData.clientId);
        }
    });

    it('should find all service requests by client via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.services) {
            let [records, recordCount] = await ServiceRequest.findAll(serviceRequestData.clientId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.clientId, serviceRequestData.clientId);
            }
        }
    });

    it('should write events via repository', async function () {
        const { Event } = app.database.models;
        for (const eventData of testData.events) {
            let record = await Event.create(eventData);
            chai.assert(record);
        }
    });

    it('should find one event by client via repository', async function () {
        const { Event } = app.repositories;
        for (const eventData of testData.events) {
            let record = await Event.findOne(eventData.clientId, eventData.id);
            chai.assert(record);
            chai.assert.equal(record.id, eventData.id);
            chai.assert.equal(record.clientId, eventData.clientId);
        }
    });

    it('should find all events by client via repository', async function () {
        const { Event } = app.repositories;
        for (const eventData of testData.events) {
            let [records, recordCount] = await Event.findAll(eventData.clientId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.clientId, eventData.clientId);
            }
        }
    });

});
