import { EventWebhook } from '@sendgrid/eventwebhook';
import type { ClientResponse } from '@sendgrid/mail';
import addrs from 'email-addresses';
import EmailForwardParser from 'email-forward-parser';
import { constants as fsConstants, promises as fs } from 'fs';
import _ from 'lodash';
import path from 'path';
import striptags from 'striptags';
import { sendEmail } from '../../email';
import logger from '../../logging';
import { sendSms } from '../../sms';
import { ChannelType, CommunicationAttributes, DispatchConfigAttributes, DispatchPayloadAttributes, EmailEventAttributes, ICommunicationRepository, IEmailStatusRepository, InboundEmailDataToRequestAttributes, InboundMapInstance, InboundSmsDataToRequestAttributes, JurisdictionAttributes, JurisdictionPreferredBroadcastChannel, ParsedForwardedData, ParsedServiceRequestAttributes, PublicId, ScheduleWindow, ServiceRequestAttributes, ServiceRequestChannel, TemplateConfigAttributes, TemplateConfigContextAttributes } from '../../types';
import { SERVICE_REQUEST_CLOSED_STATES } from '../service-requests';
import { InboundMapRepository } from './repositories';

export const publicIdSubjectLinePattern = /Request #(\d+)/;

export const htmlTagPattern = /<\/?[^>]+>/gi;

export const trailingNewLinesPattern = /\n+$/;

export const replyFrontMatterPattern = /On.*?wrote:/g; // English only! And, probably not all mail clients?

export const quotedIndentsPattern = /[<>]/g;

export const emailBodySanitizeLine = '####- Please type your reply above this line -####';

export const emailBodyDoNotReplyLine = '--- Do not reply to this email ---';
export const smsBodyDoNotReplyLine = '--- Do not reply to this message ---';

export function makeRequestURL(appClientUrl: string, appClientRequestsPath: string, serviceRequestId: string): string {
  return `${appClientUrl}${appClientRequestsPath}/${serviceRequestId}`
}

export function makeCXSurveyURL(
  jurisdiction: JurisdictionAttributes,
  serviceRequest: ServiceRequestAttributes,
): string {
  const { cxSurveyUrl } = jurisdiction;
  return `${cxSurveyUrl}?cx_case_id=${serviceRequest.id}&s=${serviceRequest.channel}`
}

export async function loadTemplate(templateName: string, templateContext: TemplateConfigContextAttributes, isBody = true): Promise<string> {
  const filepath = path.resolve(`${__dirname}/templates/${templateName}.txt`);
  const [templateType, ..._rest] = templateName.split('.');

  try {
    await fs.access(filepath, fsConstants.R_OK | fsConstants.W_OK);
  } catch (error) {
    logger.error(error);
    throw error;
  }
  const templateBuffer = await fs.readFile(filepath);
  const templateString = templateBuffer.toString();
  const isEmail = templateType === "email" ? true : false;
  const replyEnabled = templateContext.jurisdictionReplyToServiceRequestEnabled;
  const messageType = templateContext.messageType;

  let lineBreak = "\n";
  if (isEmail) { lineBreak = '<br />'; }

  let replyAboveLine = '';
  let appendString = '';

  if (isBody) {

    let doNotReplyLine = '';
    if (!replyEnabled || messageType === 'workflow') {
      const doNotReplyMsg = isEmail ? emailBodyDoNotReplyLine : smsBodyDoNotReplyLine;
      doNotReplyLine = `${lineBreak}${lineBreak}${doNotReplyMsg}${lineBreak}`;
    }

    if (isEmail && replyEnabled && messageType === 'workflow') {
      replyAboveLine = `${emailBodySanitizeLine}${lineBreak}${lineBreak}`;
    }

    const poweredByTmpl = path.resolve(`${__dirname}/templates/${templateType}.powered-by.txt`);
    const poweredByBuffer = await fs.readFile(poweredByTmpl);
    const poweredByLine = `${lineBreak}${poweredByBuffer.toString()}${lineBreak}`;

    const unsubscribeTmpl = path.resolve(`${__dirname}/templates/${templateType}.unsubscribe.txt`);
    const unsubscribeBuffer = await fs.readFile(unsubscribeTmpl);
    const unsubscribeLine = `${lineBreak}${unsubscribeBuffer.toString()}${lineBreak}`;

    appendString = `${doNotReplyLine}${poweredByLine}${lineBreak}${unsubscribeLine}${lineBreak}`;
  }

  const fullTemplateString = `${replyAboveLine}${templateString}${appendString}`;
  const templateCompile = _.template(fullTemplateString);
  return templateCompile({ context: templateContext });
}

function makePlainTextFromHtml(html: string) {
  const _tmp = striptags(html, ['br', 'p']);
  return striptags(_tmp, [], '\n');
}

export async function dispatchMessage(
  dispatchConfig: DispatchConfigAttributes,
  templateConfig: TemplateConfigAttributes,
  CommunicationRepository: ICommunicationRepository,
  EmailStatusRepository: IEmailStatusRepository):
  Promise<CommunicationAttributes | null> {
  let dispatchResponse: ClientResponse | Record<string, string> | Record<string, unknown> | null = null;
  let dispatchPayload: DispatchPayloadAttributes;
  let subject: string;
  let textBody: string;
  let htmlBody: string;
  // cant dispatch if we dont have an address to dispatch to
  if (!dispatchConfig.toEmail && !dispatchConfig.toPhone) { return null; }
  if (dispatchConfig.channel === 'email') {
    // first, check we can send to this email address
    // and we exit early if we cannot.
    // Ideally we'd never get an invalid address here but
    // Because we cant control how the various APIs are used and interact,
    // We are doing a check here at the last step before actually sending
    const emailStatus = await EmailStatusRepository.findOne(dispatchConfig.toEmail);
    if (emailStatus && emailStatus.isAllowed === false) {
      const errorMsg = `${dispatchConfig.toEmail} is not allowed for communications.`;
      logger.error({ message: errorMsg });
      throw new Error(errorMsg);
    }
    subject = await loadTemplate(
      `email.${templateConfig.name}.subject`,
      templateConfig.context,
      false
    );
    htmlBody = await loadTemplate(
      `email.${templateConfig.name}.body`,
      templateConfig.context
    );
    textBody = makePlainTextFromHtml(htmlBody);
    dispatchPayload = Object.assign({}, dispatchConfig, { subject, textBody, htmlBody })
    dispatchResponse = await sendEmail(
      dispatchPayload.sendGridApiKey,
      dispatchPayload.toEmail,
      dispatchPayload.fromEmail,
      dispatchPayload.replyToEmail,
      dispatchPayload.subject as string,
      dispatchPayload.htmlBody as string,
      dispatchPayload.textBody as string,
      dispatchPayload.sendAt
    );
  } else if (dispatchConfig.channel === 'sms') {
    textBody = await loadTemplate(
      `sms.${templateConfig.name}.body`,
      templateConfig.context,
      true
    );
    dispatchPayload = Object.assign({}, dispatchConfig, { textBody })
    dispatchResponse = await sendSms(
      dispatchPayload.twilioAccountSid as string,
      dispatchPayload.twilioMessagingServiceSid as string,
      dispatchPayload.twilioAuthToken as string,
      dispatchPayload.toPhone as string,
      dispatchPayload.fromPhone as string,
      dispatchPayload.textBody as string,
      dispatchPayload.twilioStatusCallbackURL as string,
      dispatchPayload.sendAt
    );
  } else {
    const errorMessage = `Unknown communication dispatch channel`;
    const error = new Error(errorMessage);
    const errorData = {
      message: errorMessage,
      dispatchConfig: dispatchConfig,
      error: `${error}`
    }
    logger.warn(errorData);
  }

  if (!dispatchResponse) {
    // something failed with the messaging backend
    // save what we tried to send anyway, in case we can schedule it for later
    await CommunicationRepository.create({
      channel: dispatchConfig.channel,
      address: dispatchConfig.channel === 'email' ? dispatchConfig.toEmail : dispatchConfig.toPhone,
      type: dispatchConfig.type,
      dispatched: false,
      dispatchPayload: dispatchConfig,
      dispatchResponse: {}, // no response
      accepted: false,
      delivered: false,
      serviceRequestId: dispatchConfig.serviceRequestId,
    })
    return null;
  } else {
    const record = await CommunicationRepository.create({
      channel: dispatchConfig.channel,
      address: dispatchConfig.channel === 'email' ? dispatchConfig.toEmail : dispatchConfig.toPhone,
      type: dispatchConfig.type,
      dispatched: true,
      dispatchPayload: dispatchConfig,
      dispatchResponse: dispatchResponse as Record<string, string>,
      // TODO: conditionally check
      accepted: true,
      delivered: true,
      serviceRequestId: dispatchConfig.serviceRequestId,
    })
    return record;
  }
}

export function extractForwardDataFromEmail(body: string, subject: string): ParsedForwardedData {
  return new EmailForwardParser().read(body, subject);
}

export function extractFromEmail(fromEmail: string): addrs.ParsedMailbox | null {
  // TODO: in more complex scenarios we may need to extract this from the mail body
  return addrs.parseOneAddress(fromEmail) as addrs.ParsedMailbox | null
}

export function extractForwardedForEmailFromHeaders(headers: string): string | null {
  const targetHeader = 'X-Forwarded-For:'
  let forwardStr = '';
  const headerLines = headers.split('\n');
  for (const line of headerLines) {
    if (line.includes(targetHeader)) {
      forwardStr = line.replace(targetHeader, '').trim();
      break;
    }
  }
  // we need to clean up potential traps
  const _parts = forwardStr.split(', ').map(s => s.trim())
  const cleanForwards = [];
  for (const part of _parts) {
    if (part.includes(' ')) {
      const subparts = part.split(' ');
      for (const subpart of subparts) {
        if (subpart) {
          cleanForwards.push(subpart);
        }
      }
    } else {
      if (part) {
        cleanForwards.push(part)
      }
    }
  }

  if (cleanForwards.length > 0) {
    return cleanForwards.join(', ')
  } else {
    return null
  }
}

export function extractDate(headers: string): string {
  const targetHeader = 'Date:'
  let dateStr = '';
  const headerLines = headers.split('\n');
  for (const line of headerLines) {
    if (line.includes(targetHeader)) {
      dateStr = line.replace(targetHeader, '').trim();
      break;
    }
  }
  return dateStr;
}


export function extractToEmail(inboundEmailDomain: string, headers: string, toEmail: string, ccEmail?: string, bccEmail?: string): addrs.ParsedMailbox {
  let rawAddresses = `${toEmail}`;
  const forwardEmail = extractForwardedForEmailFromHeaders(headers);
  if (ccEmail) { rawAddresses = rawAddresses.concat(",", ccEmail) }
  if (bccEmail) { rawAddresses = rawAddresses.concat(",", bccEmail) }
  if (forwardEmail) { rawAddresses = rawAddresses.concat(",", forwardEmail) }
  const addresses = addrs.parseAddressList(rawAddresses);
  const address = _.find(addresses, function (a: addrs.ParsedMailbox) { return a.domain === inboundEmailDomain; });
  return address as addrs.ParsedMailbox
}

export async function findIdentifiers(id: string, channel: ChannelType, InboundMap: InboundMapRepository): Promise<InboundMapInstance> {
  const record = await InboundMap.findOne(id, channel) as InboundMapInstance;
  return record;
}

export function extractDescriptionFromInboundEmail(emailSubject: string, emailBody: string): string {
  const [rawText, ..._] = emailBody.split(emailBodySanitizeLine);
  // do some simple cleanup steps. Will need to expand this in future .....
  const noHtmlText = makePlainTextFromHtml(rawText);
  const noQuotedIndents = noHtmlText.replace(quotedIndentsPattern, '');
  const noTrailingNewLines = noQuotedIndents.replace(trailingNewLinesPattern, '');
  const noReplyFrontMatter = noTrailingNewLines.replace(replyFrontMatterPattern, '');
  const cleanText = noReplyFrontMatter.trim();
  // when we have a new inbound email request, we want to capture the subject line as people use subject lines
  // but, when we actually have a comment on an existing request the subject line is just noise.
  let prefix = '';
  if (publicIdSubjectLinePattern.test(emailSubject) === false) {
    const extracted = emailSubject.replace(publicIdSubjectLinePattern, '')
    prefix = `${extracted}\n\n`;
  }
  return `${prefix}${cleanText}`;
}

export function _extractPublicIdFromText(text: string): string | undefined {
  let publicId;
  const match = text.match(publicIdSubjectLinePattern);
  if (match && match.length == 2) { publicId = match[1]; }
  return publicId;
}

export function extractPublicIdFromInboundEmail(emailSubject: string): string | undefined {
  return _extractPublicIdFromText(emailSubject);
}

export function extractPublicIdFromInboundSms(smsBody: string): string | undefined {
  return _extractPublicIdFromText(smsBody);
}

export function extractCreatedAtFromInboundEmail(headers: string): Date {
  const dateStr = extractDate(headers);
  return new Date(dateStr);
}

export async function extractServiceRequestfromInboundSms(data: InboundSmsDataToRequestAttributes, InboundMap: InboundMapRepository):
  Promise<[ParsedServiceRequestAttributes, PublicId]> {
  const { To, From, Body } = data;
  const inputChannel = 'sms';
  const channel = 'sms';

  const publicId = extractPublicIdFromInboundSms(Body);
  const { jurisdictionId, departmentId, staffUserId, serviceRequestId, serviceId } = await findIdentifiers(
    To, inputChannel, InboundMap
  );
  return [{
    jurisdictionId,
    departmentId,
    assignedTo: staffUserId,
    serviceRequestId,
    serviceId,
    firstName: '',
    lastName: '',
    email: '',
    phone: From,
    description: Body,
    inputChannel,
    channel,
    createdAt: new Date(),
  }, publicId];
}

export async function extractServiceRequestfromInboundEmail(data: InboundEmailDataToRequestAttributes, inboundEmailDomain: string, InboundMap: InboundMapRepository):
  Promise<[ParsedServiceRequestAttributes, PublicId]> {
  let firstName = '',
    lastName = '',
    email = '';
  const phone = '';
  const inputChannel = 'email';
  const channel = 'email';
  const { to, cc, bcc, from, headers } = data;
  let { subject, text } = data;
  let fromEmail = extractFromEmail(from);
  const toEmail = extractToEmail(inboundEmailDomain, headers, to, cc, bcc);
  const { jurisdictionId, departmentId, staffUserId, serviceRequestId, serviceId } = await findIdentifiers(
    toEmail.local, inputChannel, InboundMap
  );

  const maybeForwarded = extractForwardDataFromEmail(text, subject);
  if (maybeForwarded.forwarded) {
    fromEmail = extractFromEmail(`${maybeForwarded.email.from.name} <${maybeForwarded.email.from.address}>`);
    subject = maybeForwarded.email.subject;
    text = maybeForwarded.email.body;
  }

  const description = extractDescriptionFromInboundEmail(subject, text);
  const publicId = extractPublicIdFromInboundEmail(subject);
  const extractCreatedAt = extractCreatedAtFromInboundEmail(headers);
  let createdAt;
  if (extractCreatedAt.toUTCString() != "Invalid Date") { createdAt = extractCreatedAt; }
  if (fromEmail) {
    firstName = fromEmail.name || ''
    lastName = ''
    email = fromEmail.address || ''
  }
  return [
    {
      jurisdictionId,
      departmentId,
      assignedTo: staffUserId,
      serviceRequestId,
      serviceId,
      firstName,
      lastName,
      email,
      phone,
      description,
      inputChannel,
      channel,
      createdAt
    },
    publicId
  ];
}

export function canSubmitterComment(
  submitterEmail: string, submitterPhone: string, validEmails: string[], validPhones: string[]
): boolean {
  const emailTests = validEmails.map(e => e.toLowerCase());
  const emailTestable = submitterEmail.toLocaleLowerCase();
  let canSubmit = false;
  if (emailTests.includes(emailTestable)) {
    canSubmit = true
  }
  if (!canSubmit && validPhones.includes(submitterPhone)) {
    canSubmit = true
  }
  return canSubmit;
}

export function verifySendGridWebhook(
  publicKey: string, payload: EmailEventAttributes, signature: string | undefined, timestamp: string | undefined
): boolean {
  const ew = new EventWebhook();
  const key = ew.convertPublicKeyToECDSA(publicKey);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return ew.verifySignature(key, payload, signature, timestamp);
}

export function getServiceRequestCommentReplyTo(
  serviceRequest: ServiceRequestAttributes | null,
  inboundEmailDomain: string
): string | null {
  let returnValue = null;
  if (serviceRequest && serviceRequest.inboundMaps && serviceRequest.inboundMaps.length > 0) {
    if (!SERVICE_REQUEST_CLOSED_STATES.includes(serviceRequest.status)) {
      const map = serviceRequest.inboundMaps[0];
      returnValue = `${map.id}@${inboundEmailDomain}`;
    }
  }
  return returnValue;
}

export function getReplyToEmail(
  serviceRequest: ServiceRequestAttributes | null,
  jurisdiction: JurisdictionAttributes,
  inboundEmailDomain: string,
  defaultReplyToEmail: string): string {
  let serviceRequestReplyTo = null;

  if (jurisdiction.replyToServiceRequestEnabled) {
    serviceRequestReplyTo = getServiceRequestCommentReplyTo(serviceRequest, inboundEmailDomain);
  }
  return serviceRequestReplyTo || jurisdiction.replyToEmail || defaultReplyToEmail;
}

export function getSendFromEmail(jurisdiction: JurisdictionAttributes, defaultSendFromEmail: string) {
  return jurisdiction.sendFromEmailVerified ? jurisdiction.sendFromEmail : defaultSendFromEmail;
}

export function getSendFromPhone(jurisdiction: JurisdictionAttributes, defaultSendFromPhone: string) {
  return jurisdiction.sendFromPhone ? jurisdiction.sendFromPhone : defaultSendFromPhone;
}

export function parseDisambiguationChoiceFromText(text: string): number | null {
  let parsedValue = null;
  const integerString = text.replace(/\D/g, '');
  if (integerString) { parsedValue = parseInt(integerString); }
  return parsedValue;
}

export function makeDisambiguationMessage(msg: string, choiceMap: Record<number, string>): string {
  let disambiguationMessage = `${msg}\n\n`;
  for (const [key, value] of Object.entries(choiceMap)) {
    let line = `Existing Request #${value}`;
    if (value == 'New Request') { line = value; }
    disambiguationMessage = `${disambiguationMessage}${key}. ${line}\n`;
  }
  return disambiguationMessage;
}

/**
 * Make a sendAt date, used for scheduling broadcasts.
 * When sendAt is a Date, then it is the target sendAt date, if it is null,
 * then there is no target, i.e.: send immediately
 * reference date is simple the date we base our calculation of a sendAt date off -
 * It can come from different places, like the current time, or, a field on a service
 * request like closeDate.
 * broadcastWindow is a number that represents hours in the future, relative to referenceDate,
 * for targeting a broadcast.
 * This function just calculates a sendAt date, and does nothing to assess validity -
 * different broadcast backends have different rules for scheduling - those are called
 * in the send* functions for email and sms before dispatching off the the messaging backend.
 */
export function makeSendAtDate(referenceDate: Date, broadcastWindow: number): Date {
  const sendAt = new Date(referenceDate.getTime());
  const targetHour = referenceDate.getHours() + broadcastWindow;
  sendAt.setHours(targetHour);
  return sendAt;
}

function _renderDate(date: Date): string {
  return date.toUTCString();
}

export function maybeSetSendAt(sourceSendAt: Date | undefined, scheduleWindow: ScheduleWindow): Date | null {
  if (typeof sourceSendAt === 'undefined') { return null; }

  // https://stackoverflow.com/questions/948532/how-to-convert-a-date-to-utc/14610512#14610512
  const targetSendAt = new Date(sourceSendAt.getTime());
  const now = new Date(new Date().getTime());
  const fiveMinutes = (5 * 60 * 1000);

  if (targetSendAt.getTime() <= now.getTime() + scheduleWindow.min) {
    logger.info({
      message: `the targetSendAt is in the past so not valid for scheduling: ${_renderDate(targetSendAt)}`,
      data: {
        sourceSendAt: _renderDate(sourceSendAt),
        targetSendAt: _renderDate(targetSendAt),
        now: _renderDate(now),
        scheduleWindow
      }
    })
    return null;
  } else {
    if (targetSendAt.getTime() < now.getTime() + scheduleWindow.max) {
      logger.info({
        message: `the targetSendAt is valid for scheduling: ${_renderDate(targetSendAt)}`,
        data: {
          sourceSendAt: _renderDate(sourceSendAt),
          targetSendAt: _renderDate(targetSendAt),
          now: _renderDate(now),
          scheduleWindow
        }
      })
      return targetSendAt;
    } else {
      logger.info({
        message: `the targetSendAt is too far in the future so not valid for scheduling: ${_renderDate(targetSendAt)}`,
        data: {
          sourceSendAt: _renderDate(sourceSendAt),
          targetSendAt: _renderDate(targetSendAt),
          now: _renderDate(now),
          scheduleWindow
        }
      })
      return new Date(now.getTime() + (scheduleWindow.max - fiveMinutes));
    }
  }
}

export function setDispatchChannel(
  serviceRequestChannel: ServiceRequestChannel,
  jurisdictionPreferredBroadcastChannel: JurisdictionPreferredBroadcastChannel
) {
  if (serviceRequestChannel === 'multiple') {
    return jurisdictionPreferredBroadcastChannel;
  } else {
    return serviceRequestChannel;
  }
}
