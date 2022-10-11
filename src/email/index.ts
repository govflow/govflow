import sendGridClient from '@sendgrid/client';
import { ClientRequest } from '@sendgrid/client/src/request';
import type { ClientResponse } from '@sendgrid/mail';
import sendGridMailClient from '@sendgrid/mail';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import validator from 'validator';
import logger from '../logging';
import { EmailAttributes } from '../types';

export async function parseRawMail(source: string) {
  return await simpleParser(source);
}

function maybeSetSendAt(passedSendAt: Date | undefined): Date | null {
  if (typeof passedSendAt === 'undefined') { return null; }
  // Sendgrid accepts sendAt between now and 72 hours from now
  const now = new Date();
  const oneHour = (60 * 60 * 1000);
  const seventyTwoHours = 72 * oneHour;
  if (passedSendAt.getTime() <= now.getTime()) {
    //the passedSendAt is in the past so not valid
    return null;
  } else {
    if (passedSendAt.getTime() < now.getTime() + seventyTwoHours) {
      // the passedSendAt is valid, use it
      return passedSendAt;
    } else {
      // the passedSendAt is too far in the future - set the maximum
      return new Date(now.getTime() + (seventyTwoHours - oneHour));
    }
  }
}

export async function sendEmail(
  sendGridApiKey: string,
  toEmail: string,
  fromEmail: string,
  replyToEmail: string,
  subject: string,
  htmlBody: string,
  textBody: string,
  sendAt: Date | undefined
): Promise<ClientResponse | Record<string, string> | null> {
  if (toEmail === null || !validator.isEmail(toEmail)) {
    const errorMessage = `Cant send email to invalid address '${toEmail}'.`;
    logger.error(errorMessage);
    return null;
  }
  const message = {
    to: toEmail,
    from: fromEmail,
    replyTo: replyToEmail,
    subject: subject,
    text: textBody,
    html: htmlBody,
  } as EmailAttributes;
  const normalizedSendAt = maybeSetSendAt(sendAt);
  if (normalizedSendAt) {
    const send_at = Math.floor(normalizedSendAt.getTime() / 1000); // unix timestamp
    message.send_at = send_at;
  }
  if (process.env.COMMUNICATIONS_TO_CONSOLE) {
    return sendEmailToConsole(message)
  } else {
    return sendEmailToSendGrid(message, sendGridApiKey);
  }
}

async function sendEmailToSendGrid(message: EmailAttributes, sendGridApiKey: string): Promise<ClientResponse> {
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

async function sendEmailToConsole(message: EmailAttributes): Promise<Record<string, string>> {
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
