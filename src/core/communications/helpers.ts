import { EventWebhook } from '@sendgrid/eventwebhook';
import type { ClientResponse } from '@sendgrid/mail';
import addrs from 'email-addresses';
import { constants as fsConstants, promises as fs } from 'fs';
import _ from 'lodash';
import path from 'path';
import striptags from 'striptags';
import { sendEmail } from '../../email';
import logger from '../../logging';
import { sendSms } from '../../sms';
import { CommunicationAttributes, DispatchConfigAttributes, DispatchPayloadAttributes, EmailEventAttributes, ICommunicationRepository, IEmailStatusRepository, InboundEmailDataToRequestAttributes, InboundMapInstance, InboundMapModel, JurisdictionAttributes, ParsedServiceRequestAttributes, PublicId, ServiceRequestAttributes, TemplateConfigAttributes, TemplateConfigContextAttributes } from '../../types';
import { SERVICE_REQUEST_CLOSED_STATES } from '../service-requests';

export const publicIdSubjectLinePattern = /Request #(\d+):/;

export function makeRequestURL(appClientUrl: string, appClientRequestsPath: string, serviceRequestId: string): string {
    return `${appClientUrl}${appClientRequestsPath}/${serviceRequestId}`
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
    let appendString = '';

    if (isBody) {
        const poweredBy = path.resolve(`${__dirname}/templates/${templateType}.powered-by.txt`);
        const poweredByBuffer = await fs.readFile(poweredBy);
        appendString = `<br />${poweredByBuffer.toString()}<br />`;

        const unsubscribe = path.resolve(`${__dirname}/templates/${templateType}.unsubscribe.txt`);
        const unsubscribeBuffer = await fs.readFile(unsubscribe);
        appendString = `${appendString}<br />${unsubscribeBuffer.toString()}<br />`;
    }

    const fullTemplateString = `${templateString}${appendString}`;
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
    if (dispatchConfig.channel === 'email') {
        // first, check we can send to this email address
        // and we exit early if we cannot.
        // Ideally we'd never get an invalid address here but
        // Because we cant control how the various APIs are used and interact,
        // We are doing a check here at the last step before actually sending
        const emailStatus = await EmailStatusRepository.findOne(dispatchConfig.toEmail);
        if (emailStatus && emailStatus.isAllowed === false) {
            const errorMsg = `${dispatchConfig.toEmail} is not allowed for communications.`;
            logger.error(errorMsg);
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
            dispatchPayload.twilioAuthToken as string,
            dispatchPayload.toPhone as string,
            dispatchPayload.fromPhone as string,
            dispatchPayload.textBody as string,
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
        return null;
    } else {
        const record = await CommunicationRepository.create({
            channel: dispatchConfig.channel,
            dispatched: true,
            dispatchPayload: dispatchConfig,
            dispatchResponse: dispatchResponse as Record<string, string>,
            // TODO: conditionally check
            accepted: true,
            delivered: true,
        })
        return record;
    }
}

export function extractFromEmail(fromEmail: string): addrs.ParsedMailbox | null {
    // TODO: in more complex scenarios we may need to extract this from the mail body
    return addrs.parseOneAddress(fromEmail) as addrs.ParsedMailbox | null
}

export function extractForwardEmail(headers: string): string {
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
            cleanForwards.push(...subparts);
        } else {
            cleanForwards.push(part)
        }
    }
    return cleanForwards.join(', ');
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
    const forwardEmail = extractForwardEmail(headers);
    if (ccEmail) { rawAddresses = rawAddresses.concat(",", ccEmail) }
    if (bccEmail) { rawAddresses = rawAddresses.concat(",", bccEmail) }
    if (forwardEmail) { rawAddresses = rawAddresses.concat(",", forwardEmail) }
    const addresses = addrs.parseAddressList(rawAddresses);
    const address = _.find(addresses, function (a: addrs.ParsedMailbox) { return a.domain === inboundEmailDomain; });
    return address as addrs.ParsedMailbox
}

export async function findIdentifiers(toEmail: addrs.ParsedMailbox, InboundMap: InboundMapModel): Promise<InboundMapInstance> {
    const { local } = toEmail;
    const record = await InboundMap.findOne({ where: { id: local } }) as InboundMapInstance;
    return record;
}

export function extractDescriptionFromInboundEmail(emailSubject: string, emailBody: string): string {
    const prefix = emailSubject.replace(publicIdSubjectLinePattern, '');
    return `${prefix}\n\n${emailBody}`;
}

export function extractPublicIdFromInboundEmail(emailSubject: string): string | undefined {
    let publicId;
    const match = emailSubject.match(publicIdSubjectLinePattern);
    if (match && match.length == 2) { publicId = match[1]; }
    return publicId;
}

export function extractCreatedAtFromInboundEmail(headers: string): Date {
    const dateStr = extractDate(headers);
    return new Date(dateStr);
}

export async function extractServiceRequestfromInboundEmail(data: InboundEmailDataToRequestAttributes, inboundEmailDomain: string, InboundMap: InboundMapModel):
    Promise<[ParsedServiceRequestAttributes, PublicId]> {
    let firstName = '',
        lastName = '',
        email = '';
    const inputChannel = 'email';
    const { subject, to, cc, bcc, from, text, headers } = data;
    const toEmail = extractToEmail(inboundEmailDomain, headers, to, cc, bcc);
    const fromEmail = extractFromEmail(from);
    const { jurisdictionId, departmentId, staffUserId, serviceRequestId, serviceId } = await findIdentifiers(
        toEmail, InboundMap
    );
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
            description,
            inputChannel,
            createdAt
        },
        publicId
    ];
}

export function canSubmitterComment(submitterEmail: string, validEmails: string[]): boolean {
    if (validEmails.includes(submitterEmail)) {
        return true
    } else {
        return false;
    }
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
