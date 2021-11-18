import chai from 'chai';
import chaiHttp from 'chai-http';
import type { Application } from 'express';
import faker from 'faker';
import _ from 'lodash';
import { createApp } from '../src';
import { migrator } from '../src/db';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';

chai.use(chaiHttp);

describe('Hit all API endpoints', function () {
    let app: Application;
    let testData: Record<string, Record<string, unknown>[]>;

    before(async function () {
        await migrator.up();
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
            chai.assert.equal(res.text, JSON.stringify({ data: { name: 'govflow', version: '0.0.4-alpha' } }));
        } catch (error) {
            throw error;
        }
    });

    it('should GET staff users for jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/accounts/staff?jurisdictionId=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.count, 3);
            for (const staffUser of res.body.data) {
                chai.assert.equal(staffUser.jurisdictionId, jurisdictionId)
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET a staff user lookup table for jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/accounts/staff/lookup?jurisdictionId=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.count, 3);
            for (const staffUser of res.body.data) {
                const keys = Object.keys(staffUser);
                chai.assert.equal(keys.length, 2);
                chai.assert(keys.includes('email'));
                chai.assert(keys.includes('displayName'));
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET a staff user for jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        let staffUsers = _.filter(testData.staffUsers, { jurisdictionId });
        let staffUserId = staffUsers[0].id;
        try {
            const res = await chai.request(app).get(`/accounts/staff/${staffUserId}?jurisdictionId=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, staffUserId);
            chai.assert.equal(res.body.data.jurisdictionId, jurisdictionId);
        } catch (error) {
            throw error;
        }
    });

    it('should GET a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/jurisdictions/${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, jurisdictionId);
        } catch (error) {
            throw error;
        }
    });

    it('should POST a jurisdiction', async function () {
        let jurisdictionData = _.cloneDeep(testData.jurisdictions[0]);
        jurisdictionData.id = faker.datatype.uuid();
        jurisdictionData.jurisdictionId = faker.datatype.uuid();
        try {
            const res = await chai.request(app).post(`/jurisdictions`).send(jurisdictionData)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, jurisdictionData.id);
        } catch (error) {
            throw error;
        }
    });

    it('should fail to POST a jurisdiction', async function () {
        let jurisdictionData = _.cloneDeep(testData.jurisdictions[0]);
        try {
            const res = await chai.request(app).post(`/jurisdictions`).send(jurisdictionData)
            chai.assert.equal(res.status, 500);
            chai.assert.equal(res.body.data.message, 'Internal Server Error.');
            chai.assert.equal(res.body.data.status_code, 500);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all services for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/services?jurisdictionId=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.count, 5);
            for (const service of res.body.data) {
                chai.assert.equal(service.jurisdictionId, jurisdictionId);
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET a service for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        let services = _.filter(testData.services, { jurisdictionId });
        let serviceId = services[0].id;
        try {
            const res = await chai.request(app).get(`/services/${serviceId}?jurisdictionId=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, serviceId);
            chai.assert.equal(res.body.data.jurisdictionId, jurisdictionId);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.count, 20);
            for (const serviceRequest of res.body.data) {
                chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests filtered by status todo for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&status=todo`)
            chai.assert.equal(res.status, 200);
            for (const serviceRequest of res.body.data) {
                chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
                chai.assert.equal(serviceRequest.status, 'todo');
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests filtered by status inbox for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&status=inbox`)
            chai.assert.equal(res.status, 200);
            for (const serviceRequest of res.body.data) {
                chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
                chai.assert.equal(serviceRequest.status, 'inbox');
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests filtered by dateFrom for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        const dateFrom = '2021-06-01T00:00:00.000Z';
        try {
            const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&dateFrom=${dateFrom}`)
            chai.assert.equal(res.status, 200);
            chai.assert(res.body.count < 20);
            for (const serviceRequest of res.body.data) {
                chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
                chai.assert.isTrue(new Date(dateFrom) <= new Date(serviceRequest.createdAt));
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests filtered by dateTo for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        const dateTo = '2021-11-01T00:00:00.000Z';
        try {
            const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&dateTo=${dateTo}`)
            chai.assert.equal(res.status, 200);
            chai.assert(res.body.count < 20);
            for (const serviceRequest of res.body.data) {
                chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
                chai.assert.isTrue(new Date(dateTo) >= new Date(serviceRequest.createdAt));
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests filtered by dateFrom/dateTo range for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        const dateFrom = '2021-03-01T00:00:00.000Z';
        const dateTo = '2021-09-01T00:00:00.000Z';
        try {
            const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&dateFrom=${dateFrom}&dateTo=${dateTo}`)
            chai.assert.equal(res.status, 200);
            chai.assert(res.body.count < 20);
            for (const serviceRequest of res.body.data) {
                chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
                chai.assert.isTrue(new Date(dateFrom) <= new Date(serviceRequest.createdAt));
                chai.assert.isTrue(new Date(dateTo) >= new Date(serviceRequest.createdAt));
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests filtered by dateFrom/dateTo range and with a certain status for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        const dateFrom = '2021-03-01T00:00:00.000Z';
        const dateTo = '2021-09-01T00:00:00.000Z';
        try {
            const res = await chai.request(app).get(`/service-requests/?jurisdictionId=${jurisdictionId}&dateFrom=${dateFrom}&dateTo=${dateTo}&status=doing`)
            chai.assert.equal(res.status, 200);
            chai.assert(res.body.count < 20);
            for (const serviceRequest of res.body.data) {
                chai.assert.equal(serviceRequest.jurisdictionId, jurisdictionId);
                chai.assert.isTrue(new Date(dateFrom) <= new Date(serviceRequest.createdAt));
                chai.assert.isTrue(new Date(dateTo) >= new Date(serviceRequest.createdAt));
                chai.assert.equal(serviceRequest.status, 'doing');
            }
        } catch (error) {
            throw error;
        }
    });

    it('should GET a service request for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        let serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId });
        let serviceRequestId = serviceRequests[0].id;
        try {
            const res = await chai.request(app).get(`/service-requests/${serviceRequestId}?jurisdictionId=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, serviceRequestId);
            chai.assert.equal(res.body.data.jurisdictionId, jurisdictionId);
            chai.assert.equal(res.body.data.comments.length, 2);
            chai.assert.equal(res.body.data.comments[0].serviceRequestId, res.body.data.id);
        } catch (error) {
            throw error;
        }
    });

    it('should POST a service request for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        let serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        serviceRequestData.id = faker.datatype.uuid();
        serviceRequestData.jurisdictionId = jurisdictionId;
        try {
            const res = await chai.request(app).post(`/service-requests/?jurisdictionId=${jurisdictionId}`).send(serviceRequestData)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, serviceRequestData.id);
            chai.assert.equal(res.body.data.jurisdictionId, serviceRequestData.jurisdictionId);
        } catch (error) {
            throw error;
        }
    });

    it('should POST a service request comment for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        let serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        let commentData = { id: faker.datatype.uuid(), comment: 'This is my comment.' }
        let serviceRequestId = serviceRequestData.id;
        try {
            const res = await chai.request(app).post(`/service-requests/comments/${serviceRequestId}?jurisdictionId=${jurisdictionId}`).send(commentData)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, commentData.id);
        } catch (error) {
            throw error;
        }
    });

    it('should POST an update to a service request comment for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        let serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        // @ts-ignore
        let commentData = serviceRequestData.comments[0];
        let commentDataId = commentData.id;
        let comment = 'hey there';
        let serviceRequestId = serviceRequestData.id;
        try {
            const res = await chai.request(app).post(`/service-requests/comments/${serviceRequestId}/${commentDataId}?jurisdictionId=${jurisdictionId}`).send({ comment })
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.id, commentData.id);
            chai.assert.equal(res.body.data.comment, comment);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service request statuses for a jurisdiction', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/service-requests/statuses/?jurisdictionId=${jurisdictionId}`)
            chai.assert.equal(res.status, 200);
            chai.assert.equal(res.body.data.inbox, 'Inbox');
            chai.assert.equal(res.body.data.todo, 'Todo');
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
        let jurisdictionId = testData.jurisdictions[0].id;
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
        let jurisdictionId = testData.jurisdictions[0].id;
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
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/open311/services/some-fake-service-code.json?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one service as Open311 for a jurisdiction in XML format', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/open311/services/some-fake-service-code.xml?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should GET all service requests as Open311 for a jurisdiction in JSON format', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
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
        let jurisdictionId = testData.jurisdictions[0].id;
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
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/open311/requests/some-fake-service-request-id.json?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one service request as Open311 for a jurisdiction in XML format', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/open311/requests/some-fake-service-request-id.xml?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one Open311 token for a jurisdiction in JSON format', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/open311/tokens/some-fake-token-id.json?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 not implemented error for GET one Open311 token for a jurisdiction in XML format', async function () {
        let jurisdictionId = testData.jurisdictions[0].id;
        try {
            const res = await chai.request(app).get(`/open311/tokens/some-fake-token-id.xml?jurisdiction_id=${jurisdictionId}`)
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

});
