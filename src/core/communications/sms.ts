import getClient from 'twilio';
import logger from '../../logging';

export async function sendSms(accountSid: string, authToken: string, toPhone: string, fromPhone: string, body: string): Promise<void> {
    const client = getClient(accountSid, authToken);
    const message = {
        to: toPhone,
        from: fromPhone,
        body: body,
    }
    try {
        const response = await client.messages.create(message);
        const { sid, status, dateCreated, dateSent } = response;
    } catch (error) {
        const errorMessage = `Error from email transport: ${error}.`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
}
