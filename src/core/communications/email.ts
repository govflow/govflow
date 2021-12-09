import type { ClientResponse } from '@sendgrid/mail';
import client from '@sendgrid/mail';
import validator from 'validator';
import logger from '../../logging';

export async function sendEmail(apiKey: string, toEmail: string, fromEmail: string, subject: string, text: string, html: string): Promise<ClientResponse> {
    if (!validator.isEmail(toEmail)) {
        const errorMessage = `Cant send email to invalid address '${toEmail}'.`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
    const message = {
        to: toEmail,
        from: fromEmail,
        subject: subject,
        text: text,
        html: html,
    }
    client.setApiKey(apiKey);
    try {
        const response = await client.send(message);
        return response[0];
    } catch (error) {
        const errorMessage = `Error from email transport: ${error}.`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
}
