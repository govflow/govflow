import chai from 'chai';
import type { Application } from 'express';
import _ from 'lodash';
import { createApp } from '../src';
import { initConfig } from '../src/config';
import { dispatchMessageForPublicUser, dispatchMessageForStaffUser, loadTemplate, makeRequestURL } from '../src/core/communications/helpers';
import { sendEmail } from '../src/email';
import { sendSms } from '../src/sms';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import type { AppSettings, StaffUserAttributes, TestDataPayload } from '../src/types';

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
        const { sendGridApiKey } = config.settings as AppSettings;
        const response = await sendEmail(
            sendGridApiKey as string,
            'example@example.com',
            'example@example.com',
            'Test subject line',
            'Test <strong>html</strong> body',
            'Test text body'
        );
        chai.assert(response);
    });

    it('should send sms', async function () {
        const config = await initConfig();
        const { twilioAccountSid, twilioAuthToken, twilioFromPhone, testToPhone } = config.settings as AppSettings;
        const response = await sendSms(
            twilioAccountSid as string,
            twilioAuthToken as string,
            testToPhone as string,
            twilioFromPhone as string,
            'Test message body.',
        );
        chai.assert(response);
    });

    it('loads a template', async function () {
        const expectedOutput = '[Gov Flow]: A New Service Request Has Been Submitted\n'
        const templateName = 'email.service-request-new-staff-user.subject'
        const templateContext = {
            appName: 'Gov Flow',
            appRequestUrl: 'https://dummy.url',
            serviceRequestStatus: 'dummy-status',
            jurisdictionName: 'dummy-name',
            jurisdictionEmail: 'dummy@example.com',
            recipientName: 'Dummy Name'
        }
        const response = await loadTemplate(templateName, templateContext);
        chai.assert(new String(response).valueOf().startsWith(new String(expectedOutput).valueOf()));
    });

    it('dispatch a message for a public user', async function () {
        const { ServiceRequest, Communication, EmailStatus } = app.repositories;
        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone
        } = app.config;
        const jurisdictionId = testData.jurisdictions[0].id;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [serviceRequests, count] = await ServiceRequest.findAll(jurisdictionId);
        const serviceRequest = serviceRequests[0];
        const dispatchConfig = {
            channel: serviceRequest.communicationChannel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendGridFromEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            fromPhone: twilioFromPhone as string,
            toPhone: serviceRequest.phone as string
        }
        const templateConfig = {
            name: 'service-request-new-public-user',
            context: {
                appName,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: 'dummy-name',
                jurisdictionEmail: 'dummy@example.com',
                recipientName: serviceRequest.displayName as string
            }
        }
        const record = await dispatchMessageForPublicUser(
            serviceRequest, dispatchConfig, templateConfig, Communication, EmailStatus
        );
        chai.assert(record);
    });

    it('dispatch a message for a staff user', async function () {
        const { StaffUser, Communication, EmailStatus } = app.repositories;
        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone
        } = app.config;
        const jurisdictionId = testData.jurisdictions[0].id;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [staffUsers, staffUsersCount] = await StaffUser.findAll(jurisdictionId);
        const admins = _.filter(staffUsers, { isAdmin: true });
        const admin = admins[0] as StaffUserAttributes;
        const dispatchConfig = {
            channel: 'email',
            sendGridApiKey: sendGridApiKey as string,
            toEmail: admin.email as string,
            fromEmail: sendGridFromEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            fromPhone: twilioFromPhone as string,
            toPhone: ''
        }
        const templateConfig = {
            name: 'service-request-new-staff-user',
            context: {
                appName,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, ''),
                serviceRequestStatus: 'dummy',
                jurisdictionName: 'dummy-name',
                jurisdictionEmail: 'dummy@example.com',
                recipientName: admin.displayName as string
            }
        }
        const record = await dispatchMessageForStaffUser(
            dispatchConfig, templateConfig, Communication, EmailStatus
        );
        chai.assert(record);
    });
});
