#! /usr/bin/env node
import 'reflect-metadata';
import { initConfig } from '../config';
import { sendEmail } from '../email';
import { AppConfig } from '../types';

(async () => {
    const config = await initConfig();
    const { sendGridApiKey, sendGridFromEmail, testToEmail } = config as AppConfig;
    const response = await sendEmail(
        sendGridApiKey as string,
        testToEmail as string,
        sendGridFromEmail as string,
        sendGridFromEmail as string, // replyTo
        'Test subject line',
        'Test <strong>html</strong> body',
        'Test text body',
    );
    console.log(response);
})();
