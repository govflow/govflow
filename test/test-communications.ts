import chai from 'chai';
import type { Application } from 'express';
import _ from 'lodash';
import { createApp } from '../src';
import { initConfig } from '../src/config';
import { dispatchMessage, getReplyToEmail, getSendFromEmail, getSendFromPhone, loadTemplate, makeRequestURL } from '../src/core/communications/helpers';
import { OutboundMessageService } from '../src/core/communications/services';
import { sendEmail } from '../src/email';
import { sendSms } from '../src/sms';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import type { AppConfig, CommunicationAttributes, StaffUserAttributes, TemplateConfigContextAttributes, TestDataPayload } from '../src/types';

describe('Verify Core Communications Functionality.', function () {
    let app: Application;
    let testData: TestDataPayload;

    before(async function () {
        process.env.COMMUNICATIONS_TO_CONSOLE = 'true';
        process.env.TEST_TO_EMAIL = 'example@example.com';
        process.env.TEST_TO_PHONE = '+1 111 111 111';
        app = await createApp();
        await app.migrator.up();
        testData = makeTestData();
        await writeTestDataToDatabase(app.database, testData);
    })

    after(async function () {
        await app.database.drop({});
    })

    it('should send email', async function () {
        const config = await initConfig();
        const { sendGridApiKey } = config as AppConfig;
        const response = await sendEmail(
            sendGridApiKey as string,
            'example@example.com',
            'example@example.com',
            'example@example.com', // replyTo
            'Test subject line',
            'Test <strong>html</strong> body',
            'Test text body'
        );
        chai.assert(response);
    });

    it('should send sms', async function () {
        const config = await initConfig();
        const {
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone,
            testToPhone,
            twilioStatusCallbackURL
        } = config as AppConfig;
        const response = await sendSms(
            twilioAccountSid as string,
            twilioAuthToken as string,
            testToPhone as string,
            twilioFromPhone as string,
            'Test message body.',
            twilioStatusCallbackURL
        );
        chai.assert(response);
    });

    it('loads a template', async function () {
        const expectedOutput = '[Dummy Name - Request #1234]: A New Service Request Has Been Submitted\n'
        const templateName = 'email.service-request-new-staff-user.subject'
        const templateContext = {
            appName: 'Gov Flow',
            appRequestUrl: 'https://dummy.url',
            serviceRequestStatus: 'dummy-status',
            serviceRequestPublicId: '1234',
            jurisdictionName: 'Dummy Name',
            jurisdictionEmail: 'dummy@example.com',
            jurisdictionReplyToServiceRequestEnabled: false,
            recipientName: 'Dummy Name',
            messageType: 'core'
        } as TemplateConfigContextAttributes;
        const response = await loadTemplate(templateName, templateContext);
        chai.assert(new String(response).valueOf().startsWith(new String(expectedOutput).valueOf()));
    });

    it('dispatch a message for a public user', async function () {
        const {
            serviceRequestRepository,
            communicationRepository,
            emailStatusRepository,
            jurisdictionRepository
        } = app.repositories;
        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone,
            twilioStatusCallbackURL,
            inboundEmailDomain
        } = app.config;
        const jurisdictionId = testData.jurisdictions[0].id;
        const [serviceRequests, _count] = await serviceRequestRepository.findAll(jurisdictionId);
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        const replyToEmail = getReplyToEmail(null, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);
        const serviceRequest = serviceRequests[0];
        const dispatchConfig = {
            channel: serviceRequest.channel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            twilioStatusCallbackURL: twilioStatusCallbackURL as string,
            fromPhone: sendFromPhone as string,
            toPhone: serviceRequest.phone as string
        }
        const templateConfig = {
            name: 'service-request-new-public-user',
            context: {
                appName,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                serviceRequestStatus: serviceRequest.status,
                serviceRequestPublicId: '1234',
                jurisdictionName: 'dummy-name',
                jurisdictionEmail: 'dummy@example.com',
                jurisdictionReplyToServiceRequestEnabled: false,
                recipientName: serviceRequest.displayName as string,
                messageType: 'core'
            } as TemplateConfigContextAttributes
        }
        if (serviceRequest.channel) {
            const record = await dispatchMessage(
                dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
            );
            chai.assert(record);
        } else {
            // TODO: Need to do this check correctly
            // chai.expect(
            //     async () => await dispatchMessage(dispatchConfig, templateConfig, Communication, EmailStatus)
            // ).to.throw();
        }
    });

    it('dispatch a message for a staff user', async function () {
        const {
            staffUserRepository,
            communicationRepository,
            emailStatusRepository,
            jurisdictionRepository
        } = app.repositories;
        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone,
            twilioStatusCallbackURL,
            inboundEmailDomain
        } = app.config;
        const jurisdictionId = testData.jurisdictions[0].id;
        const [staffUsers, _staffUsersCount] = await staffUserRepository.findAll(jurisdictionId);
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
        const replyToEmail = getReplyToEmail(null, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);
        const admins = _.filter(staffUsers, { isAdmin: true });
        const admin = admins[0] as StaffUserAttributes;
        const dispatchConfig = {
            channel: 'email',
            sendGridApiKey: sendGridApiKey as string,
            toEmail: admin.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            twilioStatusCallbackURL: twilioStatusCallbackURL as string,
            fromPhone: sendFromPhone as string,
            toPhone: ''
        }
        const templateConfig = {
            name: 'service-request-new-staff-user',
            context: {
                appName,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, ''),
                serviceRequestStatus: 'dummy',
                serviceRequestPublicId: '1234',
                jurisdictionName: 'dummy-name',
                jurisdictionEmail: 'dummy@example.com',
                jurisdictionReplyToServiceRequestEnabled: false,
                recipientName: admin.displayName as string,
                messageType: 'core'
            } as TemplateConfigContextAttributes
        }
        const record = await dispatchMessage(
            dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
        );
        chai.assert(record);
    });

    it('dispatches a service request comment notification', async function () {
        const outboundMessageService = new OutboundMessageService(app.repositories, app.config);
        const { serviceRequestRepository } = app.repositories;
        const jurisdiction = testData.jurisdictions[0];
        const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId: jurisdiction.id });
        const serviceRequest = serviceRequests[0];
        const data = { comment: "hey you", addBy: "__SUBMITTER__" };
        const [record, comment] = await serviceRequestRepository.createComment(
            jurisdiction.id, serviceRequest.id, data
        );
        const commRecord = await outboundMessageService.dispatchServiceRequestComment(
            jurisdiction, record, { serviceRequestCommentId: comment.id }
        );
        chai.assert(commRecord);
    });

    it('cannot dispatch a cx survey notification when surveys are disabled', async function () {
        const outboundMessageService = new OutboundMessageService(app.repositories, app.config);
        const { serviceRequestRepository, jurisdictionRepository } = app.repositories;
        const jurisdiction = await jurisdictionRepository.findOne(testData.jurisdictions[0].id);
        const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId: jurisdiction.id });
        const serviceRequest = await serviceRequestRepository.findOne(jurisdiction.id, serviceRequests[0].id);
        const record = await outboundMessageService.dispatchCXSurvey(jurisdiction, serviceRequest);
        chai.assert.equal(record, null);
        chai.assert.equal(jurisdiction.cxSurveyEnabled, false);
    });

    it('cannot dispatch a cx survey notification when surveys are enabled but there is no survey url',
        async function () {
            const outboundMessageService = new OutboundMessageService(app.repositories, app.config);
            const { serviceRequestRepository, jurisdictionRepository } = app.repositories;
            let jurisdiction = await jurisdictionRepository.findOne(testData.jurisdictions[0].id);
            jurisdiction = await jurisdictionRepository.update(jurisdiction.id, { cxSurveyEnabled: true })
            const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId: jurisdiction.id });
            const serviceRequest = await serviceRequestRepository.findOne(jurisdiction.id, serviceRequests[0].id);
            const record = await outboundMessageService.dispatchCXSurvey(jurisdiction, serviceRequest);
            chai.assert.equal(record, null);
            chai.assert.equal(jurisdiction.cxSurveyEnabled, true);
            chai.assert.equal(jurisdiction.cxSurveyUrl, null);
        });

    it(`cannot dispatch a cx survey notification when surveys are enabled, survey url exists,
    but service request status is not equal to cxSurveyTriggerStatus`,
        async function () {
            const outboundMessageService = new OutboundMessageService(app.repositories, app.config);
            const { serviceRequestRepository, jurisdictionRepository } = app.repositories;
            const surveyUrl = 'https://example.com/cx-survey';
            const serviceRequestStatus = 'inbox';
            let jurisdiction = await jurisdictionRepository.findOne(testData.jurisdictions[0].id);
            jurisdiction = await jurisdictionRepository.update(
                jurisdiction.id, { cxSurveyEnabled: true, cxSurveyUrl: surveyUrl }
            );
            const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId: jurisdiction.id });
            let serviceRequest = await serviceRequestRepository.findOne(jurisdiction.id, serviceRequests[0].id);
            serviceRequest = await serviceRequestRepository.update(
                jurisdiction.id, serviceRequest.id, { status: serviceRequestStatus }
            );
            const record = await outboundMessageService.dispatchCXSurvey(jurisdiction, serviceRequest);
            chai.assert.equal(record, null);
            chai.assert.equal(jurisdiction.cxSurveyEnabled, true);
            chai.assert.equal(jurisdiction.cxSurveyUrl, surveyUrl);
            chai.assert.notEqual(jurisdiction.cxSurveyTriggerStatus, serviceRequest.status);
            chai.assert.equal(jurisdiction.cxSurveyTriggerStatus, 'done');
        });

    it('can dispatch a cx survey notification with default trigger status', async function () {
        const outboundMessageService = new OutboundMessageService(app.repositories, app.config);
        const { serviceRequestRepository, jurisdictionRepository } = app.repositories;
        const surveyUrl = 'https://example.com/cx-survey';
        const serviceRequestStatus = 'done';
        let jurisdiction = await jurisdictionRepository.findOne(testData.jurisdictions[0].id);
        jurisdiction = await jurisdictionRepository.update(
            jurisdiction.id, { cxSurveyEnabled: true, cxSurveyUrl: surveyUrl }
        );
        const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId: jurisdiction.id });
        let serviceRequest = await serviceRequestRepository.findOne(jurisdiction.id, serviceRequests[0].id);
        serviceRequest = await serviceRequestRepository.update(
            jurisdiction.id, serviceRequest.id, { status: serviceRequestStatus }
        );
        const record = await outboundMessageService.dispatchCXSurvey(
            jurisdiction, serviceRequest
        ) as CommunicationAttributes;
        chai.assert.equal(record.accepted, true);
        chai.assert.equal(record.delivered, true);
        chai.assert.equal(record.dispatched, true);
        chai.assert.equal(jurisdiction.cxSurveyEnabled, true);
        chai.assert.equal(jurisdiction.cxSurveyUrl, surveyUrl);
        chai.assert.equal(jurisdiction.cxSurveyTriggerStatus, serviceRequest.status);
        chai.assert.equal(jurisdiction.cxSurveyTriggerStatus, 'done');
    });

    it('can dispatch a cx survey notification with a custom trigger status', async function () {
        const outboundMessageService = new OutboundMessageService(app.repositories, app.config);
        const { serviceRequestRepository, jurisdictionRepository } = app.repositories;
        const surveyUrl = 'https://example.com/cx-survey';
        const serviceRequestStatus = 'inbox';
        let jurisdiction = await jurisdictionRepository.findOne(testData.jurisdictions[0].id);
        jurisdiction = await jurisdictionRepository.update(
            jurisdiction.id,
            { cxSurveyEnabled: true, cxSurveyUrl: surveyUrl, cxSurveyTriggerStatus: serviceRequestStatus }
        );
        const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId: jurisdiction.id });
        let serviceRequest = await serviceRequestRepository.findOne(jurisdiction.id, serviceRequests[0].id);
        serviceRequest = await serviceRequestRepository.update(
            jurisdiction.id, serviceRequest.id, { status: serviceRequestStatus }
        );
        const record = await outboundMessageService.dispatchCXSurvey(
            jurisdiction, serviceRequest
        ) as CommunicationAttributes;
        chai.assert.equal(record.accepted, true);
        chai.assert.equal(record.delivered, true);
        chai.assert.equal(record.dispatched, true);
        chai.assert.equal(jurisdiction.cxSurveyEnabled, true);
        chai.assert.equal(jurisdiction.cxSurveyUrl, surveyUrl);
        chai.assert.equal(jurisdiction.cxSurveyTriggerStatus, serviceRequest.status);
        chai.assert.equal(jurisdiction.cxSurveyTriggerStatus, 'inbox');
    });

    it('cannot dispatch a cx survey notification when the submitter is anonymous', async function () {
        const outboundMessageService = new OutboundMessageService(app.repositories, app.config);
        const { serviceRequestRepository, jurisdictionRepository } = app.repositories;
        const surveyUrl = 'https://example.com/cx-survey';
        const serviceRequestStatus = 'done';
        let jurisdiction = await jurisdictionRepository.findOne(testData.jurisdictions[0].id);
        jurisdiction = await jurisdictionRepository.update(
            jurisdiction.id, { cxSurveyEnabled: true, cxSurveyUrl: surveyUrl }
        );
        const serviceRequests = _.filter(testData.serviceRequests, { jurisdictionId: jurisdiction.id });
        let serviceRequest = await serviceRequestRepository.findOne(jurisdiction.id, serviceRequests[0].id);
        serviceRequest = await serviceRequestRepository.update(
            jurisdiction.id, serviceRequest.id, { status: serviceRequestStatus, email: '', phone: '' }
        );
        const record = await outboundMessageService.dispatchCXSurvey(
            jurisdiction, serviceRequest
        ) as CommunicationAttributes;
        chai.assert.equal(record, null);
        chai.assert.equal(serviceRequest.email, null);
        chai.assert.equal(serviceRequest.phone, null);
    });

});
