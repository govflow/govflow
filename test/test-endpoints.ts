import chai from 'chai';
import chaiHttp from 'chai-http';
import type { Application } from 'express';
import faker from 'faker';
import _ from 'lodash';
import { createApp } from '../src';
import { Open311ServiceRequestCreatePayload } from '../src/core/open311/types';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import { TestDataPayload } from '../src/types';
import { emailEvent } from './fixtures/event-email';
import { validServiceRequestData } from './fixtures/open311';

chai.use(chaiHttp);

describe('Hit all API endpoints', function () {
    let app: Application;
    let testData: TestDataPayload;

    before(async function () {
        app = await createApp();
        await app.migrator.up();
        testData = makeTestData();
        await writeTestDataToDatabase(app.database, testData);
    })

    after(async function () {
        await app.database.drop({});
    })

    it('should GET Root API information', async function () {
        const res = await chai.request(app).get('/');
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.text, JSON.stringify({ data: { name: 'govflow', version: '0.0.70-alpha' } }));
    });

    it('should GET staff users for jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/accounts/staff?jurisdictionId=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.count, 20);
        for (const staffUser of res.body.data) {
            chai.assert.equal(staffUser.jurisdictionId, jurisdictionId)
        }
    });

    it('should GET a staff user lookup table for jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/accounts/staff/lookup?jurisdictionId=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.count, 20);
        for (const staffUser of res.body.data) {
            const keys = Object.keys(staffUser);
            chai.assert.equal(keys.length, 2);
            chai.assert(keys.includes('id'));
            chai.assert(keys.includes('displayName'));
        }
    });

    it('should GET a staff user for jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const staffUsers = _.filter(testData.staffUsers, { jurisdictionId });
        const staffUserId = staffUsers[0].id;
        const res = await chai.request(app).get(`/accounts/staff/${staffUserId}?jurisdictionId=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, staffUserId);
        chai.assert.equal(res.body.data.jurisdictionId, jurisdictionId);
    });

    it('should GET a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/jurisdictions/${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, jurisdictionId);
    });

    it('should POST a jurisdiction', async function () {
        const jurisdictionData = _.cloneDeep(testData.jurisdictions[0]);
        jurisdictionData.id = faker.datatype.uuid();
        const res = await chai.request(app).post(`/jurisdictions`).send(jurisdictionData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, jurisdictionData.id);
    });

    it('should fail to POST a jurisdiction', async function () {
        const jurisdictionData = _.cloneDeep(testData.jurisdictions[0]);
        const res = await chai.request(app).post(`/jurisdictions`).send(jurisdictionData);
        chai.assert.equal(res.status, 500);
        chai.assert.equal(res.body.data.message, 'Internal Server Error.');
        chai.assert.equal(res.body.data.status_code, 500);
    });

    it('should PUT a jurisdiction', async function () {
        const jurisdictionData = _.cloneDeep(testData.jurisdictions[0]);
        const res = await chai.request(app).put(`/jurisdictions/${jurisdictionData.id}`).send({ name: 'New Name' });
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.name, 'New Name');
    });

    it('should GET all services for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/services?jurisdictionId=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.count, 5);
        for (const service of res.body.data) {
            chai.assert.equal(service.jurisdictionId, jurisdictionId);
        }
    });

    it('should GET a service for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const services = _.filter(testData.services, { jurisdictionId });
        const serviceId = services[0].id;
        const res = await chai.request(app).get(`/services/${serviceId}?jurisdictionId=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceId);
        chai.assert.equal(res.body.data.jurisdictionId, jurisdictionId);
    });

    it('should POST a service for a jurisdiction', async function () {
        const serviceData = _.cloneDeep(testData.services[0]);
        serviceData.id = faker.datatype.uuid();
        const { jurisdictionId } = serviceData;
        const res = await chai.request(app).post(`/services?jurisdictionId=${jurisdictionId}`).send(serviceData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceData.id);
    });

    it('should PUT a service for a jurisdiction', async function () {
        const serviceData = _.cloneDeep(testData.services[0]);
        const { jurisdictionId, id } = serviceData;
        const name = 'Updated name';
        const res = await chai.request(app).put(`/services/${id}/?jurisdictionId=${jurisdictionId}`).send({ name });
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.name, name);
    });

    it('should GET all service requests for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.count, 20);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
        }
    });

    it('should GET all service requests filtered by status todo for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&status=todo`);
        chai.assert.equal(res.status, 200);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
            chai.assert.equal(serviceRequest.status, 'todo');
        }
    });

    it('should GET all service requests filtered by status inbox for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&status=inbox`);
        chai.assert.equal(res.status, 200);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
            chai.assert.equal(serviceRequest.status, 'inbox');
        }
    });

    it('should GET all service requests filtered by dateFrom for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const dateFrom = '2021-06-01T00:00:00.000Z';
        const res = await chai.request(app).get(
            `/service-requests/?jurisdictionId=${jurisdictionId}&dateFrom=${dateFrom}`
        );
        chai.assert.equal(res.status, 200);
        chai.assert(res.body.count < 20);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
            chai.assert.isTrue(new Date(dateFrom) <= new Date(serviceRequest.createdAt));
        }
    });

    it('should GET all service requests filtered by dateTo for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const dateTo = '2021-10-01T00:00:00.000Z';
        const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&dateTo=${dateTo}`);
        chai.assert.equal(res.status, 200);
        chai.assert(res.body.count < 20);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
            chai.assert.isTrue(new Date(dateTo) >= new Date(serviceRequest.createdAt));
        }
    });

    it('should GET all service requests filtered by dateFrom/dateTo range for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const dateFrom = '2021-03-01T00:00:00.000Z';
        const dateTo = '2021-09-01T00:00:00.000Z';
        const res = await chai.request(app).get(
            `/service-requests/?jurisdictionId=${jurisdictionId}&dateFrom=${dateFrom}&dateTo=${dateTo}`
        );
        chai.assert.equal(res.status, 200);
        chai.assert(res.body.count < 20);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
            chai.assert.isTrue(new Date(dateFrom) <= new Date(serviceRequest.createdAt));
            chai.assert.isTrue(new Date(dateTo) >= new Date(serviceRequest.createdAt));
        }
    });

    it('should GET all requests filtered by dateFrom/dateTo range and with a certain status', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const dateFrom = '2021-03-01T00:00:00.000Z';
        const dateTo = '2021-09-01T00:00:00.000Z';
        const res = await chai.request(app).get(
            `/service-requests/?jurisdictionId=${jurisdictionId}&dateFrom=${dateFrom}&dateTo=${dateTo}&status=doing`
        );
        chai.assert.equal(res.status, 200);
        chai.assert(res.body.count < 20);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
            chai.assert.isTrue(new Date(dateFrom) <= new Date(serviceRequest.createdAt));
            chai.assert.isTrue(new Date(dateTo) >= new Date(serviceRequest.createdAt));
            chai.assert.equal(serviceRequest.status, 'doing');
        }
    });

    it('should GET all service requests filtered by existing department for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const departments = _.filter(testData.departments, { jurisdictionId });
        const departmentId = departments[0].id;
        const res = await chai.request(app).get(
            `/service-requests/?jurisdictionId=${jurisdictionId}&department=${departmentId}`
        );
        chai.assert.equal(res.status, 200);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.departmentId, departmentId);
        }
    });

    it('should GET all service requests filtered by no department for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const departmentId = 'none';
        const res = await chai.request(app).get(
            `/service-requests/?jurisdictionId=${jurisdictionId}&department=${departmentId}`
        );
        chai.assert.equal(res.status, 200);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.departmentId, null);
        }
    });

    it('should GET all service requests filtered by existing service for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const services = _.filter(testData.services, { jurisdictionId });
        const serviceId = services[0].id;
        const res = await chai.request(app).get(
            `/service-requests/?jurisdictionId=${jurisdictionId}&service=${serviceId}`
        );
        chai.assert.equal(res.status, 200);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.serviceId, serviceId);
        }
    });

    it('should GET all service requests filtered by no service for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceId = 'none';
        const res = await chai.request(app).get(
            `/service-requests/?jurisdictionId=${jurisdictionId}&service=${serviceId}`
        );
        chai.assert.equal(res.status, 200);
        for (const serviceRequest of res.body.data) {
            chai.assert.equal(serviceRequest.serviceId, null);
        }
    });

    it('should GET stats for service requests for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/service-requests/stats?jurisdictionId=${jurisdictionId}`);
        chai.assert(res.body.data.countByStats);
    });

    it('should GET a service request for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId });
        const serviceRequestId = serviceRequests[0].id;
        const res = await chai.request(app).get(
            `/service-requests/${serviceRequestId}?jurisdictionId=${jurisdictionId}`
        );
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceRequestId);
        chai.assert.equal(res.body.data.jurisdictionId, jurisdictionId);
        chai.assert.equal(res.body.data.comments.length, 2);
        chai.assert(res.body.data.comments[0].addedBy);
        chai.assert(res.body.data.comments[0].images);
        chai.assert.equal(res.body.data.inboundMaps.length, 1);
        chai.assert.equal(res.body.data.inboundMaps[0].id, serviceRequestId.replaceAll('-', ''));
        chai.assert.equal(res.body.data.comments[0].serviceRequestId, res.body.data.id);
    });

    it('should POST a service request for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        serviceRequestData.id = faker.datatype.uuid();
        serviceRequestData.jurisdictionId = jurisdictionId;
        const res = await chai.request(app).post(
            `/service-requests/?jurisdictionId=${jurisdictionId}`
        ).send(serviceRequestData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceRequestData.id);
        chai.assert.equal(res.body.data.jurisdictionId, serviceRequestData.jurisdictionId);
    });

    it('should POST a service request comment for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const commentData = { id: faker.datatype.uuid(), comment: 'This is my comment.' };
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/comments/${serviceRequestId}?jurisdictionId=${jurisdictionId}`
        ).send(commentData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, commentData.id);
    });

    it('should POST a service request comment for broadcasting to a submitter for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const commentData = {
            id: faker.datatype.uuid(),
            comment: 'This is my comment.',
            broadcastToSubmitter: true
        };
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/comments/${serviceRequestId}?jurisdictionId=${jurisdictionId}`
        ).send(commentData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, commentData.id);
        chai.assert.equal(res.body.data.isBroadcast, true);
        chai.assert.equal(res.body.data.broadcastToSubmitter, true);
        chai.assert.equal(res.body.data.broadcastToAssignee, false);
        chai.assert.equal(res.body.data.broadcastToStaff, false);
    });

    it('should POST a service request comment for broadcasting to an assignee for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const commentData = {
            id: faker.datatype.uuid(),
            comment: 'This is my comment.',
            broadcastToAssignee: true
        };
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/comments/${serviceRequestId}?jurisdictionId=${jurisdictionId}`
        ).send(commentData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, commentData.id);
        chai.assert.equal(res.body.data.isBroadcast, true);
        chai.assert.equal(res.body.data.broadcastToSubmitter, false);
        chai.assert.equal(res.body.data.broadcastToAssignee, true);
        chai.assert.equal(res.body.data.broadcastToStaff, false);
    });

    it('should POST a service request comment for broadcasting to staff for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const commentData = {
            id: faker.datatype.uuid(),
            comment: 'This is my comment.',
            broadcastToStaff: true
        };
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/comments/${serviceRequestId}?jurisdictionId=${jurisdictionId}`
        ).send(commentData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, commentData.id);
        chai.assert.equal(res.body.data.isBroadcast, true);
        chai.assert.equal(res.body.data.broadcastToSubmitter, false);
        chai.assert.equal(res.body.data.broadcastToAssignee, false);
        chai.assert.equal(res.body.data.broadcastToStaff, true);
    });

    it('should POST a service request comment for broadcasting to everyone for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const commentData = {
            id: faker.datatype.uuid(),
            comment: 'This is my comment.',
            broadcastToAssignee: true,
            broadcastToStaff: true,
            broadcastToSubmitter: true,
        };
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/comments/${serviceRequestId}?jurisdictionId=${jurisdictionId}`
        ).send(commentData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, commentData.id);
        chai.assert.equal(res.body.data.isBroadcast, true);
        chai.assert.equal(res.body.data.broadcastToSubmitter, true);
        chai.assert.equal(res.body.data.broadcastToAssignee, true);
        chai.assert.equal(res.body.data.broadcastToStaff, true);
    });

    it('should POST a service request comment not for broadcasting for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const commentData = {
            id: faker.datatype.uuid(),
            comment: 'This is my comment.',
        };
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/comments/${serviceRequestId}?jurisdictionId=${jurisdictionId}`
        ).send(commentData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, commentData.id);
        chai.assert.equal(res.body.data.isBroadcast, false);
        chai.assert.equal(res.body.data.broadcastToSubmitter, false);
        chai.assert.equal(res.body.data.broadcastToAssignee, false);
        chai.assert.equal(res.body.data.broadcastToStaff, false);
    });

    it('should POST an update to a service request comment for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const commentData = serviceRequestData.comments[0];
        const commentDataId = commentData.id;
        const comment = 'hey there';
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/comments/${serviceRequestId}/${commentDataId}?jurisdictionId=${jurisdictionId}`
        ).send({ comment });
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, commentData.id);
        chai.assert.equal(res.body.data.comment, comment);
    });

    it('should POST an update to status for a service request for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const serviceRequestId = serviceRequestData.id;
        const status = 'done';
        const res = await chai.request(app).post(
            `/service-requests/status/?jurisdictionId=${jurisdictionId}`
        ).send({ status, serviceRequestId });
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceRequestId);
        chai.assert.equal(res.body.data.status, status);
        chai.assert.notEqual(res.body.data.closeDate, null);
    });

    it('should POST an update to assignedTo for a service request for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const serviceRequestId = serviceRequestData.id;
        const assignedTo = faker.datatype.uuid();
        const res = await chai.request(app).post(
            `/service-requests/assign/?jurisdictionId=${jurisdictionId}`
        ).send({ assignedTo, serviceRequestId });
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceRequestId);
        chai.assert.equal(res.body.data.assignedTo, assignedTo);
    });

    it('should POST an update to assignedTo as null for a service request for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const serviceRequestId = serviceRequestData.id;
        const assignedTo = null;
        const res = await chai.request(app).post(
            `/service-requests/assign/?jurisdictionId=${jurisdictionId}`
        ).send({ assignedTo, serviceRequestId });
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceRequestId);
        chai.assert.equal(res.body.data.assignedTo, assignedTo);
    });

    it('should POST an update to department for a service request for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const departments = _.filter(testData.departments, { jurisdictionId });
        const departmentId = departments[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/department/?jurisdictionId=${jurisdictionId}`
        ).send({ departmentId, serviceRequestId });
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceRequestId);
        chai.assert.equal(res.body.data.departmentId, departmentId);
    });

    it('should POST an update to service for a service request for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const services = _.filter(testData.services, { jurisdictionId });
        const serviceId = services[0].id;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        const serviceRequestId = serviceRequestData.id;
        const res = await chai.request(app).post(
            `/service-requests/service/?jurisdictionId=${jurisdictionId}`
        ).send({ serviceId, serviceRequestId });
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, serviceRequestId);
        chai.assert.equal(res.body.data.serviceId, serviceId);
    });

    it('should GET all service request statuses for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/service-requests/status-list?jurisdictionId=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data[0].id, 'inbox');
        chai.assert.equal(res.body.data[0].label, 'Inbox');
    });

    it('should GET all departments for a jurisdiction', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/departments/?jurisdictionId=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data[0].jurisdictionId, jurisdictionId);
        chai.assert.equal(res.body.count, 20);
    });

    it('should GET a department', async function () {
        const department = _.cloneDeep(testData.departments[0]);
        const res = await chai.request(app).get(
            `/departments/${department.id}?jurisdictionId=${department.jurisdictionId}`
        );
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, department.id);
        chai.assert.equal(res.body.data.jurisdictionId, department.jurisdictionId);
    });

    it('should POST a department', async function () {
        const departmentData = _.cloneDeep(testData.departments[0]);
        departmentData.id = faker.datatype.uuid();
        const res = await chai.request(app).post(
            `/departments?jurisdictionId=${departmentData.jurisdictionId}`
        ).send(departmentData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, departmentData.id);
    });

    it('should POST an inbound email map', async function () {
        const inboundMapData = _.cloneDeep(testData.inboundMaps[0]);
        inboundMapData.id = 'muni-publicworks';
        const res = await chai.request(app).post(
            `/communications/create-map?jurisdictionId=${inboundMapData.jurisdictionId}`
        ).send(inboundMapData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.id, inboundMapData.id);
    });

    it('should POST an email event payload', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const payload = _.cloneDeep(emailEvent);
        const res = await chai.request(app).post(
            `/communications/events/email?jurisdictionId=${jurisdictionId}`
        ).send(payload);
        chai.assert.equal(res.status, 200);
        chai.assert(res.body.data);
        chai.assert.equal(res.body.data.message, "Received email event")
    });

    it('should GET a comms status for an email', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const emailStatuses = _.filter(testData.channelStatuses, { channel: 'email' });
        for (const status of emailStatuses) {
            const base64Email = Buffer.from(status.id).toString('base64url');
            const res = await chai.request(app).get(
                `/communications/status/email/${base64Email}?jurisdictionId=${jurisdictionId}`
            );
            chai.assert.equal(res.status, 200);
            chai.assert(res.body.data);
            chai.assert.equal(res.body.data.id, base64Email)
            chai.assert.equal(res.body.data.isAllowed, true)
        }
    });

    it('should return 501 not implemented error for Open311 service discovery', async function () {
        const res = await chai.request(app).get('/open311/v2/discovery');
        chai.assert.equal(res.status, 501);
    });

    it('should GET all services as Open311 for a jurisdiction in JSON format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/open311/v2/services.json?jurisdiction_id=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.type, 'application/json');
        chai.assert.equal(res.body.length, 6);
    });

    it('should GET all services as Open311 for a jurisdiction in XML format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/open311/v2/services.xml?jurisdiction_id=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.type, 'text/xml');
        chai.assert(res.text.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'));
        chai.assert(res.text.endsWith('</services>'));
    });

    it('should POST a service request as Open311 for a jurisdiction', async function () {
        const jurisdiction_id = testData.jurisdictions[0].id;
        const jurisdiction_services = _.filter(testData.services, { jurisdictionId: jurisdiction_id });
        const service_code = jurisdiction_services[0].id;
        const serviceRequestData = _.cloneDeep(
            validServiceRequestData[0]
        ) as unknown as Open311ServiceRequestCreatePayload;
        serviceRequestData.jurisdiction_id = jurisdiction_id;
        serviceRequestData.service_code = service_code;
        const res = await chai.request(app).post(`/open311/v2/requests.json`).send(serviceRequestData);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.body.data.service_code, serviceRequestData.service_code);
    });

    it('should return 501 error for GET one service as Open311 in JSON format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(
            `/open311/v2/services/some-fake-service-code.json?jurisdiction_id=${jurisdictionId}`
        );
        chai.assert.equal(res.status, 501);
    });

    it('should return 501 error for GET one service as Open311 in XML format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(
            `/open311/v2/services/some-fake-service-code.xml?jurisdiction_id=${jurisdictionId}`
        );
        chai.assert.equal(res.status, 501);
    });

    it.skip('should GET all service requests as Open311 for a jurisdiction in JSON format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/open311/v2/requests.json?jurisdiction_id=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.type, 'application/json');
        chai.assert.equal(res.body.length, 21);
    });

    it.skip('should GET all service requests as Open311 for a jurisdiction in XML format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(`/open311/v2/requests.xml?jurisdiction_id=${jurisdictionId}`);
        chai.assert.equal(res.status, 200);
        chai.assert.equal(res.type, 'text/xml');
        chai.assert(res.text.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'));
        chai.assert(res.text.endsWith('</service_requests>'));
    });

    it('should return 501 error for GET one service request as Open311 in JSON format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(
            `/open311/v2/requests/some-fake-service-request-id.json?jurisdiction_id=${jurisdictionId}`
        );
        chai.assert.equal(res.status, 501);
    });

    it('should return 501 error for GET one service request as Open311 in XML format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(
            `/open311/v2/requests/some-fake-service-request-id.xml?jurisdiction_id=${jurisdictionId}`
        );
        chai.assert.equal(res.status, 501);
    });

    it('should return 501 error for GET one Open311 token for a jurisdiction in JSON format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(
            `/open311/v2/tokens/some-fake-token-id.json?jurisdiction_id=${jurisdictionId}`
        );
        chai.assert.equal(res.status, 501);
    });

    it('should return 501 error for GET one Open311 token for a jurisdiction in XML format', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const res = await chai.request(app).get(
            `/open311/v2/tokens/some-fake-token-id.xml?jurisdiction_id=${jurisdictionId}`
        );
        chai.assert.equal(res.status, 501);
    });

});
