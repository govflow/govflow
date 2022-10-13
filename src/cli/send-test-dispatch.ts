#! /usr/bin/env node
import 'reflect-metadata';
import { dispatchMessage } from '../core/communications/helpers';
import { createApp } from '../index';
import { DispatchConfigAttributes, TemplateConfigContextAttributes } from '../types';

(async () => {
  // Ensure you unset process.env.COMMUNICATIONS_TO_CONSOLE to use the real backend.
  const app = await createApp();
  const {
    sendGridApiKey,
    sendGridFromEmail,
    twilioAccountSid,
    twilioMessagingServiceSid,
    twilioAuthToken,
    twilioFromPhone,
    twilioStatusCallbackURL,
    testToEmail,
    testToPhone
  } = app.config;
  const { communicationRepository, emailStatusRepository } = app.repositories;
  const messageType = 'workflow';
  const dispatchConfig = {
    channel: process.env.TEST_DISPATCH_CHANNEL,
    type: messageType,
    sendGridApiKey: sendGridApiKey as string,
    toEmail: testToEmail as string,
    fromEmail: sendGridFromEmail as string,
    twilioAccountSid: twilioAccountSid as string,
    twilioMessagingServiceSid: twilioMessagingServiceSid as string,
    twilioAuthToken: twilioAuthToken as string,
    twilioStatusCallbackURL: twilioStatusCallbackURL as string,
    fromPhone: twilioFromPhone as string,
    toPhone: testToPhone as string,
    //  Add 15 mins
    // sendAt: new Date(new Date().getTime() + (16 * 60 * 1000)),
    sendAt: new Date(),
  } as DispatchConfigAttributes;
  const templateConfig = {
    name: 'service-request-new-public-user',
    context: {
      appName: 'Test Gov Flow Message Dispatch',
      appRequestUrl: `https://example.com/`,
      serviceRequestStatus: 'inbox',
      serviceRequestPublicId: '1234',
      jurisdictionName: 'Dummy Name',
      jurisdictionEmail: 'dummy@example.com',
      jurisdictionReplyToServiceRequestEnabled: false,
      recipientName: 'Test Recipient Name',
      messageType: messageType,
    } as TemplateConfigContextAttributes
  }
  const record = await dispatchMessage(
    dispatchConfig,
    templateConfig,
    communicationRepository,
    emailStatusRepository
  );
  console.log(record);
})();
