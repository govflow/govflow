import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Application } from 'express';
import faker from 'faker';
import _ from 'lodash';
import { emailBodySanitizeLine, getReplyToEmail } from '../src/core/communications/helpers';
import { createApp } from '../src/index';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import { StaffUserAttributes, StaffUserInstance, TestDataPayload } from '../src/types';
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
        const { serviceRequestRepository } = app.repositories;
        const serviceRequestData = _.cloneDeep(testData.serviceRequests[0]);
        serviceRequestId = faker.datatype.uuid();
        jurisdictionId = serviceRequestData.jurisdictionId;
        serviceRequestData.id = serviceRequestId;
        serviceRequestData.email = serviceRequestSubmitterEmail;
        const record = await serviceRequestRepository.create(serviceRequestData);
        chai.assert.equal(record.inboundMaps.length, 1);
        chai.assert.equal(record.inboundMaps[0].id, serviceRequestData.id.replaceAll('-', ''));
    });

    it('creates a service request comment for broadcast', async function () {
        const { serviceRequestRepository } = app.repositories;
        const data = {
            comment: "Hey is this correct?",
            broadcastToSubmitter: true
        }
        const record = await serviceRequestRepository.createComment(jurisdictionId, serviceRequestId, data);
        chai.assert(record);
        chai.assert.equal(record.isBroadcast, true);
        chai.assert.equal(record.broadcastToSubmitter, true);
        chai.assert.equal(record.broadcastToAssignee, false);
        chai.assert.equal(record.broadcastToStaff, false);
    });

    it('receives an email to create a service request comment when email is from submitter', async function () {
        const { serviceRequestRepository, jurisdictionRepository } = app.repositories;
        const { inboundMessageService } = app.services;
        const { inboundEmailDomain, sendGridFromEmail } = app.config;
        const serviceRequest = await serviceRequestRepository.findOne(jurisdictionId, serviceRequestId);
        // START need this for the logic of this test, to ensure we get an inbound email for the request
        serviceRequest.status = 'todo';
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        jurisdiction.replyToServiceRequestEnabled = true
        // END need this for the logic of this test, to ensure we get an inbound email for the request
        serviceRequestInboundEmailAddress = getReplyToEmail(
            serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail
        );
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.to = serviceRequestInboundEmailAddress;
        inboundPayload.from = serviceRequestSubmitterEmail;
        inboundPayload.subject = '[Request #3456789]: this is the subject';
        inboundPayload.text = 'this is the message';
        await inboundMessageService.createServiceRequest(inboundPayload);
        const updatedServiceRequest = await serviceRequestRepository.findOne(jurisdictionId, serviceRequestId);
        chai.assert(updatedServiceRequest);
        chai.assert.equal(updatedServiceRequest.comments.length, 2);
        chai.assert.equal(updatedServiceRequest.comments[1].comment, inboundPayload.text);
    });

    it('receives an email to create a service request comment when email is from staff', async function () {
        const { serviceRequestRepository, jurisdictionRepository, staffUserRepository } = app.repositories;
        const { inboundMessageService } = app.services;
        const { inboundEmailDomain, sendGridFromEmail } = app.config;
        const serviceRequest = await serviceRequestRepository.findOne(jurisdictionId, serviceRequestId);
        // START need this for the logic of this test, to ensure we get an inbound email for the request
        serviceRequest.status = 'todo';
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        const [staffUsers, _count] = await staffUserRepository.findAll(jurisdictionId);
        const staffUser = _.find(staffUsers, (u) => { return u.isAdmin === true }) as StaffUserAttributes;
        jurisdiction.replyToServiceRequestEnabled = true;
        // END need this for the logic of this test, to ensure we get an inbound email for the request
        serviceRequestInboundEmailAddress = getReplyToEmail(
            serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail
        );
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.to = serviceRequestInboundEmailAddress;
        inboundPayload.from = staffUser.email;
        inboundPayload.subject = '[Request #98765432]: this is the subject';
        // also testing here we clean up the body from some extra patterns
        inboundPayload.text = '> > >\nOn Mon, Apr 25, 2022 Some One <some@example.com> wrote: \n\nthis is the message';
        await inboundMessageService.createServiceRequest(inboundPayload);
        const updatedServiceRequest = await serviceRequestRepository.findOne(jurisdictionId, serviceRequestId);
        chai.assert(updatedServiceRequest);
        chai.assert.equal(updatedServiceRequest.comments.length, 3);
        chai.assert.equal(updatedServiceRequest.comments[2].comment, 'this is the message');
    });

    it('broadcasts a service request comment to submitter', async function () {
        const { serviceRequestRepository, jurisdictionRepository, staffUserRepository } = app.repositories;
        const { outboundMessageService } = app.services;
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        const [staffUsers, _count] = await staffUserRepository.findAll(jurisdictionId);
        const data = {
            comment: "Comment by staff for submitter only",
            addedBy: staffUsers[0].id,
            broadcastToSubmitter: true,
            broadcastToAssignee: false,
            broadcastToStaff: false
        }
        const serviceRequest = await serviceRequestRepository.findOne(jurisdictionId, serviceRequestId);
        const serviceRequestComment = await serviceRequestRepository.createComment(
            jurisdictionId, serviceRequestId, data
        );
        const response = await outboundMessageService.dispatchServiceRequestComment(
            jurisdiction, serviceRequestComment
        );
        const dispatchPayload = response[0].dispatchPayload;
        // we only broadcast to submitter so we should only have a single communication record
        chai.assert.equal(response.length, 1);
        chai.assert.equal(dispatchPayload.channel, 'email');
        chai.assert.equal(dispatchPayload.toEmail, serviceRequest.email);
    });

    it('broadcasts a service request comment to staff only', async function () {
        const { serviceRequestRepository, jurisdictionRepository, staffUserRepository } = app.repositories;
        const { outboundMessageService } = app.services;
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        const [staffUsers, count] = await staffUserRepository.findAll(jurisdictionId);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const staffEmails = staffUsers.map((user: StaffUserInstance) => { return user.email }) as string[];
        const data = {
            comment: "Comment by staff for staff only",
            addedBy: staffUsers[0].id,
            broadcastToSubmitter: false,
            broadcastToAssignee: false,
            broadcastToStaff: true
        }
        const serviceRequestComment = await serviceRequestRepository.createComment(
            jurisdictionId, serviceRequestId, data
        );
        const response = await outboundMessageService.dispatchServiceRequestComment(
            jurisdiction, serviceRequestComment
        );
        // we should have a communication record per staff user
        chai.assert.equal(response.length, count);
        for (const record of response) {
            chai.assert.equal(record.dispatchPayload.channel, 'email');
            chai.assert(staffEmails.includes(record.dispatchPayload.toEmail))

        }
    });

    it('uses an email sanitize line for outgoing email when reply to service request is enabled', async function () {
        const { serviceRequestRepository, jurisdictionRepository, staffUserRepository } = app.repositories;
        const { outboundMessageService } = app.services;
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        // ensure it is the value we need for the test
        jurisdiction.replyToServiceRequestEnabled = true;
        const [staffUsers, _count] = await staffUserRepository.findAll(jurisdictionId);
        const data = {
            comment: "Comment by staff for submitter only",
            addedBy: staffUsers[0].id,
            broadcastToSubmitter: true,
            broadcastToAssignee: false,
            broadcastToStaff: false
        }
        const serviceRequestComment = await serviceRequestRepository.createComment(
            jurisdictionId, serviceRequestId, data
        );
        const response = await outboundMessageService.dispatchServiceRequestComment(
            jurisdiction, serviceRequestComment
        );
        const dispatchResponse = JSON.parse(response[0].dispatchResponse as unknown as string);
        chai.assert(dispatchResponse.text.includes(emailBodySanitizeLine));
    });

    it('does not use sanitize line for outgoing email when reply to service request is disabled', async function () {
        const { serviceRequestRepository, jurisdictionRepository, staffUserRepository } = app.repositories;
        const { outboundMessageService } = app.services;
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        // ensure it is the value we need for the test
        jurisdiction.replyToServiceRequestEnabled = false;
        const [staffUsers, _count] = await staffUserRepository.findAll(jurisdictionId);
        const data = {
            comment: "Comment by staff for submitter only",
            addedBy: staffUsers[0].id,
            broadcastToSubmitter: true,
            broadcastToAssignee: false,
            broadcastToStaff: false
        }
        const serviceRequestComment = await serviceRequestRepository.createComment(
            jurisdictionId, serviceRequestId, data
        );
        const response = await outboundMessageService.dispatchServiceRequestComment(
            jurisdiction, serviceRequestComment
        );
        const dispatchResponse = JSON.parse(response[0].dispatchResponse as unknown as string);
        chai.assert.equal(dispatchResponse.text.includes(emailBodySanitizeLine), false);
    });

});
