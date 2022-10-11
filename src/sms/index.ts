import getClient from 'twilio';
import logger from '../logging';
import { SmsAttributes } from '../types';

function maybeSetSendAt(passedSendAt: Date | undefined): Date | null {
  if (typeof passedSendAt === 'undefined') { return null; }
  // Twilio accepts sendAt between 15 minutes and seven days from now
  const now = new Date();
  const fifteenMinutes = 15 * 60 * 1000;
  const sevenDays = 7 * (24 * (60 * 60 * 1000));
  if (passedSendAt.getTime() <= now.getTime() + fifteenMinutes) {
    // passedSendAt is in the past or less than 15 mins so not valid
    return null;
  } else {
    if (passedSendAt.getTime() < now.getTime() + sevenDays) {
      // passedSendAt is valid - use it
      return passedSendAt;
    } else {
      // passedSendAt is too far in future - use the maximum
      return new Date(now.getTime() + sevenDays);
    }
  }
}

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
  const normalizedSendAt = maybeSetSendAt(sendAt);
  if (normalizedSendAt) {
    message.messagingServiceSid = messagingServiceSid;
    message.scheduleType = 'fixed';
    message.sendAt = normalizedSendAt;
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
  const client = getClient(accountSid, authToken);
  try {
    const response = await client.messages.create(message);
    return response as unknown as Record<string, string>;
  } catch (error) {
    const errorMessage = `Error from sms transport: ${error}.`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

async function sendSmsToConsole(message: SmsAttributes): Promise<Record<string, string>> {
  console.log(message);
  return message as unknown as Record<string, string>;
}
