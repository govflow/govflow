import chai from 'chai';
import chaiHttp from 'chai-http';
import type { Application } from 'express';
import faker from 'faker';
import _ from 'lodash';
import { name, version } from '../package.json';
import { createApp } from '../src';
import makeTestData, { writeTestDataToDatabase } from './fixtures/data';

chai.use(chaiHttp);

describe('Hit all API endpoints', function () {
    let app: Application;
    let testData: Record<string, Record<string, unknown>[]>;

    before(async function () {
        app = await createApp();
        testData = makeTestData();
        await writeTestDataToDatabase(app.database, testData);
    })

    after(async function () {
        await app.database.drop({});
    })

    it('should GET Root API information', async function () {
        try {
            const res = await chai.request(app).get('/')
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.text, JSON.stringify({ data: { name, version } }));
        } catch (error) {
            throw error;
        }
    });

    it('should GET staff users for client', async function () {
        let clientId = testData.clients[0].id;
        try {
            const res = await chai.request(app).get(`/accounts/staff/${clientId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.count, 3);
            for (const staffUser of res.body.data) {
                chai.assert.equal(staffUser.clientId, clientId)
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET a staff user for client', async function () {
        let clientId = testData.clients[0].id;
        let staffUsers = _.filter(testData.staffUsers, { clientId });
        let staffUserId = staffUsers[0].id;
        try {
            const res = await chai.request(app).get(`/accounts/staff/${clientId}/${staffUserId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, staffUserId);
            chai.assert.equal(res.body.data.clientId, clientId);
        } catch (error) {
            throw error;
        }
    });

    it('should GET a client', async function () {
        let clientId = testData.clients[0].id;
        try {
            const res = await chai.request(app).get(`/accounts/client/${clientId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, clientId);
        } catch (error) {
            throw error;
        }
    });

    it('should POST a client', async function () {
        let clientData = _.cloneDeep(testData.clients[0]);
        clientData.id = faker.datatype.uuid();
        clientData.jurisdictionId = faker.datatype.uuid();
        try {
            const res = await chai.request(app).post(`/accounts/client/`).send(clientData)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, clientData.id);
        } catch (error) {
            throw error;
        }
    });

    it('should fail to POST a client', async function () {
        let clientData = _.cloneDeep(testData.clients[0]);
        clientData.id = faker.datatype.uuid();
        // clientData.jurisdictionId = faker.datatype.uuid(); is required
        try {
            const res = await chai.request(app).post(`/accounts/client/`).send(clientData)
            chai.assert.equal(res.status, 500);
            chai.assert.equal(res.body.data.message, 'Internal Server Error.');
            chai.assert.equal(res.body.data.status_code, 500);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all services for a client', async function () {
        let clientId = testData.clients[0].id;
        try {
            const res = await chai.request(app).get(`/services/${clientId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.count, 5);
            for (const service of res.body.data) {
                chai.assert.equal(service.clientId, clientId);
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET a service for a client', async function () {
        let clientId = testData.clients[0].id;
        let services = _.filter(testData.services, { clientId });
        let serviceId = services[0].id;
        try {
            const res = await chai.request(app).get(`/services/${clientId}/${serviceId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, serviceId);
            chai.assert.equal(res.body.data.clientId, clientId);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests for a client', async function () {
        let clientId = testData.clients[0].id;
        try {
            const res = await chai.request(app).get(`/service-requests/${clientId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.count, 20);
            for (const serviceRequest of res.body.data) {
                chai.assert.equal(serviceRequest.clientId, clientId);
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET a service request for a client', async function () {
        let clientId = testData.clients[0].id;
        let serviceRequests = _.filter(testData.serviceRequests, { clientId });
        let serviceRequestId = serviceRequests[0].id;
        try {
            const res = await chai.request(app).get(`/service-requests/${clientId}/${serviceRequestId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, serviceRequestId);
            chai.assert.equal(res.body.data.clientId, clientId);
            chai.assert.equal(res.body.data.comments.length, 2);
            chai.assert.equal(res.body.data.comments[0].serviceRequestId, res.body.data.id);
        } catch (error) {
            throw error;
        }
    });

    it('should POST a service request for a client', async function () {
        let clientId = testData.clients[0].id;
        let serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        serviceRequestData.id = faker.datatype.uuid();
        serviceRequestData.clientId = clientId;
        try {
            const res = await chai.request(app).post(`/service-requests/:clientId`).send(serviceRequestData)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, serviceRequestData.id);
            chai.assert.equal(res.body.data.clientId, serviceRequestData.clientId);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for Open311 service discovery', async function () {
        try {
            const res = await chai.request(app).get('/open311/discovery')
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all services as Open311 for a jurisdiction in JSON format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/services.json?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.type, 'application/json')
            chai.assert.equal(res.body.count, 5);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all services as Open311 for a jurisdiction in XML format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/services.xml?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.type, 'text/xml')
            chai.assert(res.text.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'))
            chai.assert(res.text.endsWith('</services>'))
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one service as Open311 for a jurisdiction in JSON format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/services/some-fake-service-code.json?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one service as Open311 for a jurisdiction in XML format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/services/some-fake-service-code.xml?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests as Open311 for a jurisdiction in JSON format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/requests.json?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.type, 'application/json')
            chai.assert.equal(res.body.count, 21);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests as Open311 for a jurisdiction in XML format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/requests.xml?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.type, 'text/xml')
            chai.assert(res.text.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'))
            chai.assert(res.text.endsWith('</service_requests>'))
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one service request as Open311 for a jurisdiction in JSON format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/requests/some-fake-service-request-id.json?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one service request as Open311 for a jurisdiction in XML format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/requests/some-fake-service-request-id.xml?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one Open311 token for a jurisdiction in JSON format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/tokens/some-fake-token-id.json?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one Open311 token for a jurisdiction in XML format', async function () {
        let jurisdictionId = testData.clients[0].jurisdictionId;
        try {
            const res = await chai.request(app).get(`/open311/tokens/some-fake-token-id.xml?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

});
