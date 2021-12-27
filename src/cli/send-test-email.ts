#! /usr/bin/env node
import 'reflect-metadata';
import { initConfig } from '../config';
import { sendEmail } from '../email';
import { AppSettings } from '../types';

(async () => {
    const config = await initConfig();
    const { sendGridApiKey, sendGridFromEmail, testToEmail } = config.settings as AppSettings;
    const response = await sendEmail(
        sendGridApiKey as string,
        testToEmail as string,
        sendGridFromEmail as string,
        'Test subject line',
        'Test text body',
    );
    console.log(response);
})();
