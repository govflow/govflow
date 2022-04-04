#! /usr/bin/env node
import 'reflect-metadata';
import { dispatchMessage } from '../core/communications/helpers';
import { createApp } from '../index';

(async () => {
    // Ensure you unset process.env.COMMUNICATIONS_TO_CONSOLE to use the real backend.
    const app = await createApp();
    const {
        sendGridApiKey,
        sendGridFromEmail,
        twilioAccountSid,
        twilioAuthToken,
        twilioFromPhone,
        testToEmail,
        testToPhone
    } = app.config;
    const { Communication, EmailStatus } = app.repositories;
    const dispatchConfig = {
        channel: 'email', // can manually change to sms to test that
        sendGridApiKey: sendGridApiKey as string,
        toEmail: testToEmail as string,
        fromEmail: sendGridFromEmail as string,
        twilioAccountSid: twilioAccountSid as string,
        twilioAuthToken: twilioAuthToken as string,
        fromPhone: twilioFromPhone as string,
        toPhone: testToPhone as string
    }
    const templateConfig = {
        name: 'service-request-new-public-user',
        context: {
            appName: 'Test Gov Flow Message Dispatch',
            appRequestUrl: `https://example.com/`,
            serviceRequestStatus: 'inbox',
            serviceRequestPublicId: '1234',
            jurisdictionName: 'Dummy Name',
            jurisdictionEmail: 'dummy@example.com',
            recipientName: 'Test Recipient Name'
        }
    }
    const record = await dispatchMessage(
        dispatchConfig,
        templateConfig,
        Communication,
        EmailStatus
    );
    console.log(record);
})();
