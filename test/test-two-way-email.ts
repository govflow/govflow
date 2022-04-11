import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Application } from 'express';
import faker from 'faker';
import _ from 'lodash';
import { getServiceRequestCommentReplyTo } from '../src/core/communications/helpers';
import { createApp } from '../src/index';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import { TestDataPayload } from '../src/types';
import { inboundEmail } from './fixtures/inbound';

chai.use(chaiAsPromised);

describe('Test two-way email communications.', function () {

    let app: Application;
    let testData: TestDataPayload;
    let serviceRequestInboundEmailAddress: string;
    const serviceRequestSubmitterEmail = 'edward@example.com';
    let serviceRequestId: string;
    let jurisdictionId: string;

    before(async function () {
        app = await createApp();
        await app.migrator.up();
        testData = makeTestData();
        await writeTestDataToDatabase(app.database, testData);
    })

    after(async function () {
        await app.database.drop({});
    })

    it('creates a service request with an inbound map', async function () {
        const { ServiceRequest } = app.repositories;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        serviceRequestId = faker.datatype.uuid();
        jurisdictionId = serviceRequestData.jurisdictionId;
        serviceRequestData.id = serviceRequestId;
        serviceRequestData.email = serviceRequestSubmitterEmail;
        const record = await ServiceRequest.create(serviceRequestData);
        chai.assert.equal(record.inboundMaps.length, 1);
        chai.assert.equal(record.inboundMaps[0].id, serviceRequestData.id.replaceAll('-', ''));
    });

    it('creates a service request comment for broadcast', async function () {
        const { ServiceRequest } = app.repositories;
        const data = {
            comment: "Hey is this correct?",
            broadcastToSubmitter: true
        }
        const record = await ServiceRequest.createComment(jurisdictionId, serviceRequestId, data);
        chai.assert(record);
        chai.assert.equal(record.isBroadcast, true);
        chai.assert.equal(record.broadcastToSubmitter, true);
        chai.assert.equal(record.broadcastToAssignee, false);
        chai.assert.equal(record.broadcastToStaff, false);
    });

    it('receives an email to create a service request comment', async function () {
        const { ServiceRequest, InboundEmail } = app.repositories;
        const { inboundEmailDomain } = app.config;
        const serviceRequest = await ServiceRequest.findOne(jurisdictionId, serviceRequestId);
        serviceRequestInboundEmailAddress = getServiceRequestCommentReplyTo(serviceRequest, inboundEmailDomain);
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.to = serviceRequestInboundEmailAddress;
        inboundPayload.from = serviceRequestSubmitterEmail;
        inboundPayload.text = 'this is the message';
        await InboundEmail.createServiceRequest(inboundPayload);
        const updatedServiceRequest = await ServiceRequest.findOne(jurisdictionId, serviceRequestId);
        chai.assert(updatedServiceRequest);
        chai.assert.equal(updatedServiceRequest.comments.length, 2);
        chai.assert.equal(updatedServiceRequest.comments[1].comment, 'This is the subject line\n\nthis is the message');
    });

    // it('throws if receives an email to create a service request comment from an invalid sender', async function () {
    //     const { ServiceRequest, InboundEmail } = app.repositories;
    //     const { inboundEmailDomain } = app.config;
    //     const serviceRequest = await ServiceRequest.findOne(jurisdictionId, serviceRequestId);
    //     serviceRequestInboundEmailAddress = getServiceRequestCommentReplyTo(serviceRequest, inboundEmailDomain);
    //     const inboundPayload = _.cloneDeep(inboundEmail);
    //     inboundPayload.to = serviceRequestInboundEmailAddress;
    //     inboundPayload.text = 'this is the message';
    //     chai.expect(await InboundEmail.createServiceRequest(inboundPayload)).to.throw();
    // });

});
