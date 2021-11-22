import { initConfig } from '../config';
import { sendEmail } from '../core/communications/email';
import { AppSettings } from '../types';

(async () => {
    const config = await initConfig();
    const { sendGridApiKey, sendGridFromEmail, testToEmail } = config.settings as AppSettings;
    const response = await sendEmail(
        sendGridApiKey as string,
        testToEmail as string,
        sendGridFromEmail as string,
        'Test subject line',
        'Test plain text body',
        '<strong>Test HTML body.</strong>'
    );
    console.log(response);
})();
