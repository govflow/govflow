import sendGridClient from '@sendgrid/client';
import { ClientRequest } from '@sendgrid/client/src/request';
import type { ClientResponse, MailDataRequired } from '@sendgrid/mail';
import sendGridMailClient from '@sendgrid/mail';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import validator from 'validator';
import logger from '../logging';

export async function parseRawMail(source: string) {
    return await simpleParser(source);
}

export async function sendEmail(
    sendGridApiKey: string,
    toEmail: string,
    fromEmail: string,
    replyToEmail: string,
    subject: string,
    htmlBody: string,
    textBody: string
): Promise<ClientResponse | Record<string, string>> {
    if (!validator.isEmail(toEmail)) {
        const errorMessage = `Cant send email to invalid address '${toEmail}'.`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
    const message = {
        to: toEmail,
        from: fromEmail,
        replyTo: replyToEmail,
        subject: subject,
        text: textBody,
        html: htmlBody,
    }
    if (process.env.COMMUNICATIONS_TO_CONSOLE) {
        return sendEmailToConsole(message)
    } else {
        return sendEmailToSendGrid(message, sendGridApiKey);
    }
}

async function sendEmailToSendGrid(message: MailDataRequired, sendGridApiKey: string): Promise<ClientResponse> {
    sendGridMailClient.setApiKey(sendGridApiKey);
    try {
        const response = await sendGridMailClient.send(message);
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

export async function verifySenderRequest(
    sendGridApiKey: string,
    sendFromEmail: string,
    sendReplyToEmail: string | undefined,
    name: string,
    address: string | undefined,
    city: string | undefined,
    state: string | undefined,
    country: string | undefined,
    zip: string | undefined): Promise<ClientResponse> {
    sendGridClient.setApiKey(sendGridApiKey);
    const data = {
        "nickname": name,
        "from_email": sendFromEmail,
        "from_name": name,
        "reply_to": sendReplyToEmail || sendFromEmail,
        "reply_to_name": name,
        "address": address,
        "address2": "",
        "state": state,
        "city": city,
        "country": country,
        "zip": zip
    };

    const request = {
        url: `/v3/verified_senders`,
        method: 'POST',
        body: data
    } as ClientRequest

    try {
        const response = await sendGridClient.request(request);
        return response[0];
    } catch (error) {
        const errorMessage = `Error from email transport: ${error}.`;
        logger.error(errorMessage);
        throw error;
    }
}
