#! /usr/bin/env node
import 'reflect-metadata';
import { initConfig } from '../config';
import { sendSms } from '../sms';
import { AppConfig } from '../types';

(async () => {
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
  console.log(response);
})();
