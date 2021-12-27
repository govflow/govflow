import getClient from 'twilio';
import logger from '../logging';
import { SmsAttributes } from '../types';

export async function sendSms(
    accountSid: string,
    authToken: string,
    toPhone: string,
    fromPhone: string,
    body: string
): Promise<Record<string, string>> {
    const message = {
        to: toPhone,
        from: fromPhone,
        body: body,
    } as SmsAttributes
    if (process.env.COMMUNICATIONS_TO_CONSOLE) {
        return sendSmsToConsole(message);
    } else {
        return sendSmsToTwilio(message, accountSid, authToken);
    }
}

async function sendSmsToTwilio(
    message: SmsAttributes, accountSid: string, authToken: string
): Promise<Record<string, string>> {
    const client = getClient(accountSid, authToken);
    try {

        const response = await client.messages.create(message);
        return response as unknown as Record<string, string>;
    } catch (error) {
        const errorMessage = `Error from email transport: ${error}.`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
}

async function sendSmsToConsole(message: SmsAttributes): Promise<Record<string, string>> {
    console.log(message);
    return message as unknown as Record<string, string>;
}
