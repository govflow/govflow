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
    const { Communication } = app.repositories;
    const dispatchConfig = {
        channel: 'email', // can manually change to sms to test that
        apiKey: sendGridApiKey as string,
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
            jurisdictionName: 'dummy_jurisdiction_id',
            recipientName: 'Test Recipient Name'
        }
    }
    const record = await dispatchMessage(
        dispatchConfig,
        templateConfig,
        Communication
    );
    console.log(record);
})();
