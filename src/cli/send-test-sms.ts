#! /usr/bin/env node
import 'reflect-metadata';
import { initConfig } from '../config';
import { sendSms } from '../sms';
import { AppConfig } from '../types';

(async () => {
    const config = await initConfig();
    const { twilioAccountSid, twilioAuthToken, twilioFromPhone, testToPhone } = config as AppConfig;
    const response = await sendSms(
        twilioAccountSid as string,
        twilioAuthToken as string,
        testToPhone as string,
        twilioFromPhone as string,
        'Test message body.',
    );
    console.log(response);
})();
