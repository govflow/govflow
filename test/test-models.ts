import chai from 'chai';
import type { Application } from 'express';
import { migrator } from '../src/db';
import { createApp } from '../src/index';
import makeTestData from '../src/tools/fake-data-generator';

describe('Verify Core Models.', function () {

    let app: Application;
    //@ts-ignore
    let testData;

    before(async function () {
        await migrator.up();
        app = await createApp();
        testData = makeTestData();
    })

    after(async function () {
        await app.database.drop({});
    })

    it('should find all models', async function () {
        const { Jurisdiction, StaffUser, Event, ServiceRequest, ServiceRequestComment, Service } = app.database.models;
        chai.assert(Jurisdiction);
        chai.assert(StaffUser);
        chai.assert(Event);
        chai.assert(ServiceRequest);
        chai.assert(ServiceRequestComment);
        chai.assert(Service);
    });

    it('should write jurisdictions to database', async function () {
        const { Jurisdiction } = app.database.models;
        // @ts-ignore
        for (const jurisdictionData of testData.jurisdictions) {
            let record = await Jurisdiction.create(jurisdictionData);
            chai.assert(record);
        }
    });

    it('should write staff users to database', async function () {
        const { StaffUser } = app.database.models;
        // @ts-ignore
        for (const staffUserData of testData.staffUsers) {
            let record = await StaffUser.create(staffUserData);
            chai.assert(record);
        }
    });

    it('should write services to database', async function () {
        const { Service } = app.database.models;
        // @ts-ignore
        for (const serviceData of testData.services) {
            let record = await Service.create(serviceData);
            chai.assert(record);
        }
    });

    it('should write service requests to database', async function () {
        const { ServiceRequest } = app.database.models;
        // @ts-ignore
        for (const serviceRequestData of testData.serviceRequests) {
            let record = await ServiceRequest.create(serviceRequestData);
            chai.assert(record);
        }
    });

    it('should write events to database', async function () {
        const { Event } = app.database.models;
        // @ts-ignore
        for (const eventData of testData.events) {
            let record = await Event.create(eventData);
            chai.assert(record);
        }
    });

});
