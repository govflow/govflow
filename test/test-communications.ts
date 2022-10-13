import chai from 'chai';
import type { Application } from 'express';
import _ from 'lodash';
import { createApp } from '../src';
import { initConfig } from '../src/config';
import { dispatchMessage, getReplyToEmail, getSendFromEmail, getSendFromPhone, loadTemplate, makeRequestURL, makeSendAtDate } from '../src/core/communications/helpers';
import { OutboundMessageService } from '../src/core/communications/services';
import { SERVICE_REQUEST_CLOSED_STATES } from '../src/core/service-requests';
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
    const sendAt = new Date();
    const response = await sendEmail(
      sendGridApiKey as string,
      'example@example.com',
      'example@example.com',
      'example@example.com', // replyTo
      'Test subject line',
      'Test <strong>html</strong> body',
      'Test text body',
      sendAt,
    );
    chai.assert(response);
  });

  it('should send email with valid sendAt: future', async function () {
    const config = await initConfig();
    const { sendGridApiKey } = config as AppConfig;
    const referenceDate = new Date();
    const fakeBroadcastWindow = 10;
    const sendAt = makeSendAtDate(referenceDate, fakeBroadcastWindow);
    const response = await sendEmail(
      sendGridApiKey as string,
      'example@example.com',
      'example@example.com',
      'example@example.com', // replyTo
      'Test subject line',
      'Test <strong>html</strong> body',
      'Test text body',
      sendAt,
    );
    const data = JSON.parse(response as unknown as string);
    chai.assert(response);
    chai.assert(typeof data.send_at === "number") // we have a unix timestamp for sending
  });

  it('should send email with invalid sendAt: past', async function () {
    const config = await initConfig();
    const { sendGridApiKey } = config as AppConfig;
    const referenceDate = new Date();
    const fakeBroadcastWindow = -10;
    const sendAt = makeSendAtDate(referenceDate, fakeBroadcastWindow);
    const response = await sendEmail(
      sendGridApiKey as string,
      'example@example.com',
      'example@example.com',
      'example@example.com', // replyTo
      'Test subject line',
      'Test <strong>html</strong> body',
      'Test text body',
      sendAt,
    );
    const data = JSON.parse(response as unknown as string);
    chai.assert(response);
    chai.assert(typeof data.send_at === "undefined") // when not present it means send immediately
  });

  it('should send email with invalid sendAt: too far in future', async function () {
    const config = await initConfig();
    const { sendGridApiKey } = config as AppConfig;
    const referenceDate = new Date();
    const fakeBroadcastWindow = 24 * 10;
    const sendAt = makeSendAtDate(referenceDate, fakeBroadcastWindow);
    const response = await sendEmail(
      sendGridApiKey as string,
      'example@example.com',
      'example@example.com',
      'example@example.com', // replyTo
      'Test subject line',
      'Test <strong>html</strong> body',
      'Test text body',
      sendAt,
    );
    const data = JSON.parse(response as unknown as string);
    chai.assert(response);
    chai.assert(typeof data.send_at === 'number'); // it still sends at furthest future time possible
  });

  it('should send sms', async function () {
    const config = await initConfig();
    const {
      twilioAccountSid,
      twilioMessagingServiceSid,
      twilioAuthToken,
      twilioFromPhone,
      testToPhone,
      twilioStatusCallbackURL
    } = config as AppConfig;
    const sendAt = new Date();
    const response = await sendSms(
      twilioAccountSid as string,
      twilioMessagingServiceSid as string,
      twilioAuthToken as string,
      testToPhone as string,
      twilioFromPhone as string,
      'Test message body.',
      twilioStatusCallbackURL,
      sendAt,
    );
    chai.assert(response);
  });

  it('should send sms with valid sendAt: future', async function () {
    const config = await initConfig();
    const {
      twilioAccountSid,
      twilioMessagingServiceSid,
      twilioAuthToken,
      twilioFromPhone,
      testToPhone,
      twilioStatusCallbackURL
    } = config as AppConfig;
    const referenceDate = new Date();
    const fakeBroadcastWindow = 24;
    const sendAt = makeSendAtDate(referenceDate, fakeBroadcastWindow);
    const response = await sendSms(
      twilioAccountSid as string,
      twilioMessagingServiceSid as string,
      twilioAuthToken as string,
      testToPhone as string,
      twilioFromPhone as string,
      'Test message body.',
      twilioStatusCallbackURL,
      sendAt,
    );
    chai.assert(response);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    chai.assert(response.sendAt instanceof Date);
  });

  it('should send sms with invalid sendAt: past', async function () {
    const config = await initConfig();
    const {
      twilioAccountSid,
      twilioMessagingServiceSid,
      twilioAuthToken,
      twilioFromPhone,
      testToPhone,
      twilioStatusCallbackURL
    } = config as AppConfig;
    const referenceDate = new Date();
    const fakeBroadcastWindow = -25;
    const sendAt = makeSendAtDate(referenceDate, fakeBroadcastWindow);
    const response = await sendSms(
      twilioAccountSid as string,
      twilioMessagingServiceSid as string,
      twilioAuthToken as string,
      testToPhone as string,
      twilioFromPhone as string,
      'Test message body.',
      twilioStatusCallbackURL,
      sendAt,
    );
    chai.assert(response);
    chai.assert(typeof response.sendAt === 'undefined');
  });

  it('should send sms with invalid sendAt: too far in future', async function () {
    const config = await initConfig();
    const {
      twilioAccountSid,
      twilioMessagingServiceSid,
      twilioAuthToken,
      twilioFromPhone,
      testToPhone,
      twilioStatusCallbackURL
    } = config as AppConfig;
    const referenceDate = new Date();
    const fakeBroadcastWindow = 24 * 5;
    const sendAt = makeSendAtDate(referenceDate, fakeBroadcastWindow);
    const response = await sendSms(
      twilioAccountSid as string,
      twilioMessagingServiceSid as string,
      twilioAuthToken as string,
      testToPhone as string,
      twilioFromPhone as string,
      'Test message body.',
      twilioStatusCallbackURL,
      sendAt,
    );
    chai.assert(response);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    chai.assert(response.sendAt instanceof Date); // still sends with furthest schedule available
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
      messageType: 'workflow'
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
      twilioMessagingServiceSid,
      twilioAuthToken,
      twilioFromPhone,
      twilioStatusCallbackURL,
      inboundEmailDomain
    } = app.config;
    const jurisdictionId = testData.jurisdictions[0].id;
    const [serviceRequests, _count] = await serviceRequestRepository.findAll(jurisdictionId);
    const jurisdiction = await jurisdictionRepository.findOne(jurisdictionId);
    const { workflowBroadcastWindow } = jurisdiction;
    const replyToEmail = getReplyToEmail(null, jurisdiction, inboundEmailDomain, sendGridFromEmail);
    const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
    const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);
    const serviceRequest = serviceRequests[0];
    const referenceDate = SERVICE_REQUEST_CLOSED_STATES.includes(serviceRequest.status)
      ? serviceRequest.closeDate
      : new Date();
    const sendAt = makeSendAtDate(referenceDate, workflowBroadcastWindow);
    const dispatchConfig = {
      channel: serviceRequest.channel as string,
      type: 'workflow',
      sendGridApiKey: sendGridApiKey as string,
      toEmail: serviceRequest.email as string,
      fromEmail: sendFromEmail as string,
      replyToEmail: replyToEmail as string,
      twilioAccountSid: twilioAccountSid as string,
      twilioMessagingServiceSid: twilioMessagingServiceSid as string,
      twilioAuthToken: twilioAuthToken as string,
      twilioStatusCallbackURL: twilioStatusCallbackURL as string,
      fromPhone: sendFromPhone as string,
      toPhone: serviceRequest.phone as string,
      sendAt,
      serviceRequestId: serviceRequest.id,
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
        messageType: 'workflow'
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
      twilioMessagingServiceSid,
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
    const sendAt = new Date();
    const dispatchConfig = {
      channel: 'email',
      type: 'workflow',
      sendGridApiKey: sendGridApiKey as string,
      toEmail: admin.email as string,
      fromEmail: sendFromEmail as string,
      replyToEmail: replyToEmail as string,
      twilioAccountSid: twilioAccountSid as string,
      twilioMessagingServiceSid: twilioMessagingServiceSid as string,
      twilioAuthToken: twilioAuthToken as string,
      twilioStatusCallbackURL: twilioStatusCallbackURL as string,
      fromPhone: sendFromPhone as string,
      toPhone: '',
      sendAt,
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
        messageType: 'workflow'
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
