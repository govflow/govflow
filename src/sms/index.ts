import getClient from 'twilio';
import { maybeSetSendAt } from '../core/communications/helpers';
import logger from '../logging';
import { SmsAttributes } from '../types';

export async function sendSms(
  accountSid: string,
  messagingServiceSid: string,
  authToken: string,
  toPhone: string,
  fromPhone: string,
  body: string,
  statusCallback: string,
  sendAt: Date | undefined,
): Promise<Record<string, string>> {
  const message = {
    to: toPhone,
    from: fromPhone,
    body,
    statusCallback
  } as SmsAttributes;
  const scheduleWindow = {
    min: 15 * 60 * 1000, // fifteen minutes
    max: (60 * 60 * 1000) * 168 // seven days
  }
  const normalizedSendAt = maybeSetSendAt(sendAt, scheduleWindow);
  if (normalizedSendAt) {
    message.messagingServiceSid = messagingServiceSid;
    message.scheduleType = 'fixed';
    message.sendAt = normalizedSendAt;
    logger.info(
      `Timestamp for SMS scheduling: ${normalizedSendAt.toUTCString()}`,
      {
        message: message
      }
    )
  }
  if (process.env.COMMUNICATIONS_TO_CONSOLE) {
    return sendSmsToConsole(message);
  } else {
    return sendSmsToTwilio(message, accountSid, authToken);
  }
}

async function sendSmsToTwilio(
  message: SmsAttributes, accountSid: string, authToken: string
): Promise<Record<string, string>> {
  logger.info(
    `Routing sms to Twilio for ${message.to}`,
    { message },
  )
  const client = getClient(accountSid, authToken);
  try {
    logger.info(`sending sms to twilio: ${message.sendAt}`, { message })
    const response = await client.messages.create(message);
    return response as unknown as Record<string, string>;
  } catch (error) {
    const errorMessage = `Error from sms transport: ${error}.`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function sendSmsToConsole(message: SmsAttributes): Promise<Record<string, string>> {
  logger.info(
    `Routing sms to console for ${message.to}`,
    { message }
  )
  return message as unknown as Record<string, string>;
}
