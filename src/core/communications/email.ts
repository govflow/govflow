import type { ClientResponse, MailDataRequired } from '@sendgrid/mail';
import sendGridClient from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import validator from 'validator';
import logger from '../../logging';

export async function sendEmail(apiKey: string, toEmail: string, fromEmail: string, subject: string, body: string): Promise<ClientResponse | Record<string, string>> {
    if (!validator.isEmail(toEmail)) {
        const errorMessage = `Cant send email to invalid address '${toEmail}'.`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
    const message = {
        to: toEmail,
        from: fromEmail,
        subject: subject,
        text: body,
        html: body,
    }
    if (process.env.COMMUNICATIONS_TO_CONSOLE) {
        return sendEmailToConsole(message)
    } else {
        return sendEmailToSendGrid(message, apiKey);
    }
}

async function sendEmailToSendGrid(message: MailDataRequired, apiKey: string): Promise<ClientResponse> {
    sendGridClient.setApiKey(apiKey);
    try {
        const response = await sendGridClient.send(message);
        return response[0];
    } catch (error) {
        const errorMessage = `Error from email transport: ${error}.`;
        logger.error(errorMessage);
        throw error;
    }
}

async function sendEmailToConsole(message: Record<string, string>): Promise<Record<string, string>> {
    const streamTransporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
    })
    const jsonTransporter = nodemailer.createTransport({
        jsonTransport: true,
    })
    const streamResponse = await streamTransporter.sendMail(message);
    const jsonResponse = await jsonTransporter.sendMail(message);
    console.log(streamResponse.message.toString());
    return jsonResponse.message as unknown as Record<string, string>;
}
