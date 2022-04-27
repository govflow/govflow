import chai from 'chai';
import type { Application } from 'express';
import faker from 'faker';
import _ from 'lodash';
import { SERVICE_REQUEST_CLOSED_STATES } from '../src/core/service-requests/models';
import { STAFF_USER_PERMISSIONS } from '../src/core/staff-users/models';
import { createApp } from '../src/index';
import makeTestData from '../src/tools/fake-data-generator';
import { ChannelStatusAttributes, StaffUserAttributes, TestDataPayload } from '../src/types';
import { emailEvent } from './fixtures/event-email';

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
        const { Service, Jurisdiction, StaffUser, ServiceRequest } = app.repositories;
        chai.assert(Jurisdiction);
        chai.assert(StaffUser);
        chai.assert(ServiceRequest);
        chai.assert(Service);
    });

    it('should write jurisdictions via repository', async function () {
        const { Jurisdiction } = app.repositories;
        for (const jurisdictionData of testData.jurisdictions) {
            const record = await Jurisdiction.create(jurisdictionData);
            chai.assert(record);
            chai.assert.equal(record.id, jurisdictionData.id);
        }
    });

    it('should find jurisdictions by id via repository', async function () {
        const { Jurisdiction } = app.repositories;
        for (const jurisdictionData of testData.jurisdictions) {
            const record = await Jurisdiction.findOne(jurisdictionData.id as string);
            chai.assert(record);
            chai.assert.equal(record.id, jurisdictionData.id);
        }
    });

    it('should find jurisdictions by jurisdictionId via repository', async function () {
        const { Jurisdiction } = app.repositories;
        for (const jurisdictionData of testData.jurisdictions) {
            const record = await Jurisdiction.findOne(jurisdictionData.id as string);
            chai.assert(record);
            chai.assert.equal(record.id, jurisdictionData.id);
        }
    });

    it('should write staff users via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            const record = await StaffUser.create(staffUserData);
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, staffUserData.jurisdictionId);
            chai.assert.equal(record.email, staffUserData.email);
        }
    });

    it('should find one staff user by jurisdiction via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            const record = await StaffUser.findOne(
                staffUserData.jurisdictionId, staffUserData.id
            ) as StaffUserAttributes;
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, staffUserData.jurisdictionId);
        }
    });

    it('should find a displayName for a staff user', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            const record = await StaffUser.findOne(
                staffUserData.jurisdictionId, staffUserData.id
            ) as StaffUserAttributes;
            chai.assert(record);
            chai.assert.equal(record.displayName, `${record.firstName} ${record.lastName}`);
        }
    });

    it('should find staff user permissions for a staff user', async function () {
        const { StaffUser } = app.repositories;
        for (const staffUserData of testData.staffUsers) {
            const record = await StaffUser.findOne(
                staffUserData.jurisdictionId, staffUserData.id
            ) as StaffUserAttributes;
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
            const [records, _count] = await StaffUser.findAll(staffUserData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.jurisdictionId, staffUserData.jurisdictionId);
            }
        }
    });

    it('should return a staff user lookup table by jurisdiction via repository', async function () {
        const { StaffUser } = app.repositories;
        for (const staffuserData of testData.staffUsers) {
            const [records, _count] = await StaffUser.lookupTable(staffuserData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                const keys = Object.keys(record);
                chai.assert.equal(keys.length, 2);
                chai.assert(keys.includes('id'));
                chai.assert(keys.includes('displayName'));
            }
        }
    });

    it('should write services via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            const record = await Service.create(serviceData);
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, serviceData.jurisdictionId);
            chai.assert.equal(record.name, serviceData.name);
        }
    });

    it('should update a service via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            const name = faker.name.findName();
            const record = await Service.update(serviceData.jurisdictionId, serviceData.id, { name });
            chai.assert(record);
            chai.assert.equal(record.jurisdictionId, serviceData.jurisdictionId);
            chai.assert.equal(record.name, name);
        }
    });

    // it.skip('should write Open311 service requests via repository', async function () {
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
            const record = await Service.findOne(serviceData.jurisdictionId, serviceData.id);
            chai.assert(record);
            chai.assert.equal(record.id, serviceData.id);
            chai.assert.equal(record.jurisdictionId, serviceData.jurisdictionId);
        }
    });

    it('should find all services by jurisdiction via repository', async function () {
        const { Service } = app.repositories;
        for (const serviceData of testData.services) {
            const [records, _count] = await Service.findAll(serviceData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.jurisdictionId, serviceData.jurisdictionId);
            }
        }
    });

    it('should write service requests via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            const record = await ServiceRequest.create(serviceRequestData);
            chai.assert(record);
            if (SERVICE_REQUEST_CLOSED_STATES.includes(record.status)) {
                chai.assert.notEqual(record.closeDate, null);
                chai.assert.typeOf(record.closeDate, 'date')
            } else {
                chai.assert.equal(record.closeDate, null);
            }
        }
    });

    it('should write service request comments via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            for (const comment of serviceRequestData.comments) {
                const record = await ServiceRequest.createComment(
                    serviceRequestData.jurisdictionId, serviceRequestData.id, comment
                );
                chai.assert(record);
            }
        }
    });

    it('should update service request comments via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            for (const comment of serviceRequestData.comments) {
                const record = await ServiceRequest.updateComment(
                    serviceRequestData.jurisdictionId, serviceRequestData.id, comment.id, { comment: 'hey there' }
                );
                chai.assert(record);
                chai.assert(record.comment = 'hey there');
            }
        }
    });

    it('should update service request status via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const status = 'doing';
        for (const serviceRequestData of testData.serviceRequests) {
            const record = await ServiceRequest.update(
                serviceRequestData.jurisdictionId, serviceRequestData.id, { status }
            );
            chai.assert(record);
            chai.assert(record.status = status);
        }
    });

    it('should update service request assignedTo via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const assignedTo = faker.datatype.uuid();
        for (const serviceRequestData of testData.serviceRequests) {
            const record = await ServiceRequest.update(
                serviceRequestData.jurisdictionId, serviceRequestData.id, { assignedTo }
            );
            chai.assert(record);
            chai.assert(record.assignedTo = assignedTo);
        }
    });

    it('should show default inputChannel as webform for service request via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            const [records, _count] = await ServiceRequest.findAll(serviceRequestData.jurisdictionId);
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
        const record = await ServiceRequest.update(serviceRequest.jurisdictionId, serviceRequest.id, updateFields);
        chai.assert(record.status === 'blocked');
    });

    it('should find a list of possible statuses for a service request via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const jurisdictionId = testData.serviceRequests[0].jurisdictionId;
        const records = await ServiceRequest.findStatusList(jurisdictionId);
        chai.assert(records[0].id === 'inbox');
        chai.assert(records[0].label === 'Inbox');
    });

    it('should find one service request by jurisdiction via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.serviceRequests) {
            const record = await ServiceRequest.findOne(serviceRequestData.jurisdictionId, serviceRequestData.id);
            chai.assert(record);
            chai.assert.equal(record.id, serviceRequestData.id);
            chai.assert.equal(record.jurisdictionId, serviceRequestData.jurisdictionId);
        }
    });

    it('should find all service requests by jurisdiction via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.services) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [records, recordCount] = await ServiceRequest.findAll(serviceRequestData.jurisdictionId);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.jurisdictionId, serviceRequestData.jurisdictionId);
            }
        }
    });

    it('should get unfiltered service request stats by jurisdiction via repository', async function () {
        const { ServiceRequest } = app.repositories;
        for (const serviceRequestData of testData.services) {
            const { countByStatus } = await ServiceRequest.getStats(serviceRequestData.jurisdictionId as string);
            chai.assert(countByStatus);
        }
    });

    it('should write communications via repository', async function () {
        const { Communication } = app.repositories;
        for (const communicationData of testData.communications) {
            const record = await Communication.create(communicationData);
            chai.assert(record);
        }
    });

    it('should find communications for a service request via repository', async function () {
        const { Communication } = app.repositories;

        for (const serviceRequestData of testData.serviceRequests) {
            const [records, count] = await Communication.findByServiceRequestId(serviceRequestData.id);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.serviceRequestId, serviceRequestData.id);
            }
            chai.assert.equal(count, 10)
        }
    });

    it('should write departments via repository', async function () {
        const { Department } = app.repositories;
        for (const departmentData of testData.departments) {
            const record = await Department.create(departmentData);
            chai.assert(record);
        }
    });

    it('should find one department by jurisdiction via repository', async function () {
        const { Department } = app.repositories;
        for (const departmentData of testData.departments) {
            const record = await Department.findOne(departmentData.jurisdictionId, departmentData.id);
            chai.assert(record);
            chai.assert.equal(record.id, departmentData.id);
            chai.assert.equal(record.jurisdictionId, departmentData.jurisdictionId);
        }
    });

    it('should find all departments for a jurisdiction via repository', async function () {
        const { Department } = app.repositories;

        for (const jurisdictionData of testData.jurisdictions) {
            const [records, count] = await Department.findAll(jurisdictionData.id);
            chai.assert(records);
            for (const record of records) {
                chai.assert.equal(record.jurisdictionId, jurisdictionData.id);
            }
            chai.assert.equal(count, 20)
        }
    });

    it('should update service request department via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const jurisdictionId = testData.serviceRequests[0].jurisdictionId;
        const departments = _.filter(testData.departments, { jurisdictionId });
        const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId });
        const departmentId = departments[10].id;
        for (const serviceRequestData of serviceRequests) {
            const record = await ServiceRequest.update(
                serviceRequestData.jurisdictionId, serviceRequestData.id, { departmentId }
            );
            chai.assert(record);
            chai.assert.equal(record.departmentId, departmentId);
        }
    });

    it('should update service request service via repository', async function () {
        const { ServiceRequest } = app.repositories;
        const jurisdictionId = testData.serviceRequests[0].jurisdictionId;
        const services = _.filter(testData.services, { jurisdictionId });
        const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId });
        const serviceId = services[2].id;
        for (const serviceRequestData of serviceRequests) {
            const record = await ServiceRequest.update(
                serviceRequestData.jurisdictionId, serviceRequestData.id, { serviceId }
            );
            chai.assert(record);
            chai.assert.equal(record.serviceId, serviceId);
        }
    });

    it('should write an inbound map record via repository', async function () {
        const { InboundMessage } = app.services;
        for (const inboundMapData of testData.inboundMaps) {
            const record = await InboundMessage.createMap(inboundMapData);
            chai.assert(record);
        }
    });

    it('should write email channel statuses from email events via repository', async function () {
        const { EmailStatus } = app.repositories;
        for (const event of emailEvent) {
            const record = await EmailStatus.createFromEvent(event);
            chai.assert(record);
        }
    });

    it('should write email channel statuses via repository', async function () {
        const { EmailStatus } = app.repositories;
        for (const status of testData.channelStatuses) {
            const record = await EmailStatus.create(status);
            chai.assert(record);
        }
    });

    it('should get an email channel status via repository', async function () {
        const { EmailStatus } = app.repositories;
        const emailStatuses = _.filter(testData.channelStatuses, { channel: 'email' });
        for (const status of emailStatuses) {
            const record = await EmailStatus.findOne(status.id) as ChannelStatusAttributes;
            chai.assert(record);
            chai.assert.equal(record.id, status.id);
            chai.assert.equal(record.isAllowed, status.isAllowed);
            chai.assert.equal(record.log[0][0], status.log[0][0]);
        }
    });
});
