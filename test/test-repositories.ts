import chai from 'chai';
import type { Application } from 'express';
import faker from 'faker';
import { STAFF_USER_PERMISSIONS } from '../src/core/staff-users/models';
import { createApp } from '../src/index';
import makeTestData from '../src/tools/fake-data-generator';
import { TestDataPayload } from '../src/types';

describe('Verify Core Repositories.', function () {

    let app: Application;
    let testData: TestDataPayload;

    before(async function () {
        app = await createApp();
        await app.migrator.up();
        testData = makeTestData();
    })

    after(async function () {
        await app.database.drop({});
    })

    it('should find all repositories', async function () {
        const { Service, Jurisdiction, StaffUser, ServiceRequest, Event } = app.repositories;
        chai.assert(Jurisdiction);
        chai.assert(StaffUser);
        chai.assert(Event);
        chai.assert(ServiceRequest);
        chai.assert(Service);
    });

    it('should write jurisdictions via repository', async function () {
        const { Jurisdiction } = app.repositories;
        for (const jurisdictionData of testData.jurisdictions) {
            let record = await Jurisdiction.create(jurisdictionData);
            chai.assert(record);
            chai.assert.equal(record.id, jurisdictionData.id);
        }
    });

    it('should find jurisdictions by id via repository', async function () {
        const { Jurisdiction } = app.repositories;
        for (const jurisdictionData of testData.jurisdictions) {
            let record = await Jurisdiction.findOne(jurisdictionData.id as string);
            chai.assert(record);
            chai.assert.equal(record.id, jurisdictionData.id);
        }
    });

    it('should find jurisdictions by jurisdictionId via repository', async function () {
        const { Jurisdiction } = app.repositories;
        for (const jurisdictionData of testData.jurisdictions) {
            let record = await Jurisdiction.findOne(jurisdictionData.id as string);
            chai.assert(record);
            chai.assert.equal(record.id, jurisdictionData.id);
        }
    });

    it('should write staff users via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            let record = await StaffUser.create(staffUserData);
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, staffUserData.jurisdictionId);
            chai.assert.equal(record.email, staffUserData.email);
        }
    });

    it('should find one staff user by jurisdiction via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            let record = await StaffUser.findOne(staffUserData.jurisdictionId, staffUserData.id);
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, staffUserData.jurisdictionId);
        }
    });

    it('should find a displayName for a staff user', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            let record = await StaffUser.findOne(staffUserData.jurisdictionId, staffUserData.id);
            chai.assert(record);
            chai.assert.equal(record.displayName, `${record.firstName} ${record.lastName}`);
        }
    });

    it('should find staff user permissions for a staff user', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            let record = await StaffUser.findOne(staffUserData.jurisdictionId, staffUserData.id);
            chai.assert(record);
            chai.assert.equal(record.permissions.length, 1)
            for (const permission of record.permissions) {
                chai.assert(STAFF_USER_PERMISSIONS.includes(permission));
            }
        }
    });

    it('should find all staff users by jurisdiction via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            let [records, recordCount] = await StaffUser.findAll(staffUserData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.jurisdictionId, staffUserData.jurisdictionId);
            }
        }
    });

    it('should return a staff user lookup table by jurisdiction via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffuserData of testData.staffUsers) {
            const [records, count] = await StaffUser.lookupTable(staffuserData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                const keys = Object.keys(record);
                chai.assert.equal(keys.length, 2);
                chai.assert(keys.includes('email'));
                chai.assert(keys.includes('displayName'));
            }
        }
    });

    it('should write services via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            let record = await Service.create(serviceData);
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, serviceData.jurisdictionId);
            chai.assert.equal(record.name, serviceData.name);
        }
    });

    it('should update a service via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            let name = faker.name.findName();
            let record = await Service.update(serviceData.jurisdictionId, serviceData.id, { name });
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, serviceData.jurisdictionId);
            chai.assert.equal(record.name, name);
        }
    });

    // it('should write Open311 services via repository', async function () {
    //     const { Service } = app.repositories;
    //     const jurisdictionId = testData.jurisdictions[0].id
    //     for (const serviceData of validServiceData) {
    //         let record = await Service.create(Object.assign({}, serviceData, { jurisdictionId }));
    //         chai.assert(record);
    //         chai.assert.equal(record.service_code, serviceData.service_code);
    //         chai.assert.equal(record.service_name, serviceData.service_name);
    //     }
    // });

    // it('should write Open311 service requests via repository', async function () {
    //     const { Open311ServiceRequest } = app.repositories;
    //     const jurisdictionId = testData.jurisdictions[0].id
    //     for (const serviceRequestData of validServiceRequestData) {
    //         let record = await Open311ServiceRequest.create(Object.assign({}, serviceRequestData, { jurisdiction_id: jurisdictionId }));
    //         chai.assert(record);
    //         chai.assert.equal(record.description, serviceRequestData.description);
    //         chai.assert.equal(record.service_code, serviceRequestData.service_code);
    //         chai.assert.equal(record.lat, serviceRequestData.lat);
    //         chai.assert.equal(record.long, serviceRequestData.long);
    //     }
    // });

    it('should find one service by jurisdiction via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            let record = await Service.findOne(serviceData.jurisdictionId, serviceData.id);
            chai.assert(record);
            chai.assert.equal(record.id, serviceData.id);
            chai.assert.equal(record.jurisdictionId, serviceData.jurisdictionId);
        }
    });

    it('should find all services by jurisdiction via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            let [records, recordCount] = await Service.findAll(serviceData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.jurisdictionId, serviceData.jurisdictionId);
            }
        }
    });

    it('should write service requests via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            let record = await ServiceRequest.create(serviceRequestData);
            chai.assert(record);
        }
    });

    it('should write service request comments via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            //@ts-ignore
            for (const comment of serviceRequestData.comments) {
                let record = await ServiceRequest.createComment(serviceRequestData.jurisdictionId, serviceRequestData.id, comment);
                chai.assert(record);
            }
        }
    });

    it('should update service request comments via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            //@ts-ignore
            for (const comment of serviceRequestData.comments) {
                let record = await ServiceRequest.updateComment(serviceRequestData.jurisdictionId, serviceRequestData.id, comment.id, { comment: 'hey there' });
                chai.assert(record);
                chai.assert(record.comment = 'hey there');
            }
        }
    });

    it('should update service request status via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const status = 'doing';
        for (const serviceRequestData of testData.serviceRequests) {
            //@ts-ignore
            let record = await ServiceRequest.updateStatus(serviceRequestData.jurisdictionId, serviceRequestData.id, status);
            chai.assert(record);
            chai.assert(record.status = status);
        }
    });

    it('should update service request assignedTo via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const assignedTo = faker.datatype.uuid();
        for (const serviceRequestData of testData.serviceRequests) {
            //@ts-ignore
            let record = await ServiceRequest.updateAssignedTo(serviceRequestData.jurisdictionId, serviceRequestData.id, assignedTo);
            chai.assert(record);
            chai.assert(record.assignedTo = assignedTo);
        }
    });

    it('should show default inputChannel as webform for service request via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            //@ts-ignore
            let [records, count] = await ServiceRequest.findAll(serviceRequestData.jurisdictionId);
            for (const record of records) {
                chai.assert(record);
                chai.assert(record.inputChannel = 'webform');
            }
        }
    });

    it('should update a service request via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const serviceRequest = testData.serviceRequests[0];
        const updateFields = { status: 'blocked' };
        let record = await ServiceRequest.update(serviceRequest.jurisdictionId, serviceRequest.id, updateFields);
        chai.assert(record.status === 'blocked');
    });

    it('should find a list of possible statuses for a service request via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const jurisdictionId = testData.serviceRequests[0].jurisdictionId;
        let record = await ServiceRequest.findStatusList(jurisdictionId);
        chai.assert(record.inbox === 'Inbox');
        chai.assert(record.done === 'Done');
    });

    it('should find one service request by jurisdiction via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            let record = await ServiceRequest.findOne(serviceRequestData.jurisdictionId, serviceRequestData.id);
            chai.assert(record);
            chai.assert.equal(record.id, serviceRequestData.id);
            chai.assert.equal(record.jurisdictionId, serviceRequestData.jurisdictionId);
        }
    });

    it('should find all service requests by jurisdiction via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.services) {
            let [records, recordCount] = await ServiceRequest.findAll(serviceRequestData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.jurisdictionId, serviceRequestData.jurisdictionId);
            }
        }
    });

    it('should get unfiltered service request stats by jurisdiction via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.services) {
            // @ts-ignore
            let { countByStatus } = await ServiceRequest.getStats(serviceRequestData.jurisdictionId as string);
            chai.assert(countByStatus);
        }
    });

    it('should write events via repository', async function () {
        const { Event } = app.repositories;
        for (const eventData of testData.events) {
            let record = await Event.create(eventData);
            chai.assert(record);
        }
    });

    it('should find one event by jurisdiction via repository', async function () {
        const { Event } = app.repositories;
        for (const eventData of testData.events) {
            let record = await Event.findOne(eventData.jurisdictionId, eventData.id);
            chai.assert(record);
            chai.assert.equal(record.id, eventData.id);
            chai.assert.equal(record.jurisdictionId, eventData.jurisdictionId);
        }
    });

    it('should find all events by jurisdiction via repository', async function () {
        const { Event } = app.repositories;
        for (const eventData of testData.events) {
            let [records, recordCount] = await Event.findAll(eventData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.jurisdictionId, eventData.jurisdictionId);
            }
        }
    });

});
