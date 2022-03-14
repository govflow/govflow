import type { ClientResponse } from '@sendgrid/mail';
import addrs from 'email-addresses';
import { constants as fsConstants, promises as fs } from 'fs';
import _ from 'lodash';
import path from 'path';
import striptags from 'striptags';
import { sendEmail } from '../../email';
import logger from '../../logging';
import { sendSms } from '../../sms';
import { CommunicationAttributes, DispatchConfigAttributes, DispatchPayloadAttributes, ICommunicationRepository, InboundEmailDataToRequestAttributes, ParsedServiceRequestAttributes, PublicId, ServiceRequestAttributes, TemplateConfigAttributes, TemplateConfigContextAttributes } from '../../types';

export const publicIdSubjectLinePattern = /Request #(\d+):/;

export function makeRequestURL(appClientUrl: string, appClientRequestsPath: string, serviceRequestId: string): string {
    return `${appClientUrl}${appClientRequestsPath}/${serviceRequestId}`
}

export async function loadTemplate(templateName: string, templateContext: TemplateConfigContextAttributes, withUnsubscribe = false): Promise<string> {
    const filepath = path.resolve(`${__dirname}/templates/${templateName}.txt`);
    try {
        await fs.access(filepath, fsConstants.R_OK | fsConstants.W_OK);
    } catch (error) {
        logger.error(error);
        throw error;
    }
    const templateBuffer = await fs.readFile(filepath);
    const templateString = templateBuffer.toString();
    let appendString: string;

    if (withUnsubscribe) {
        const [templateType, ..._rest] = templateName.split('.');
        const appendUnsubscribe = path.resolve(`${__dirname}/templates/${templateType}.unsubscribe.txt`);
        const unsubscribeBuffer = await fs.readFile(appendUnsubscribe);
        appendString = `<br />${unsubscribeBuffer.toString()}`;
    } else {
        appendString = '';
    }

    const fullTemplateString = `${templateString}${appendString}`;
    const templateCompile = _.template(fullTemplateString);
    return templateCompile({ context: templateContext });
}

function makePlainTextFromHtml(html: string) {
    const _tmp = striptags(html, ['br', 'p']);
    return striptags(_tmp, [], '\n');
}


export async function dispatchMessageForPublicUser(
    serviceRequest: ServiceRequestAttributes,
    dispatchConfig: DispatchConfigAttributes,
    templateConfig: TemplateConfigAttributes,
    CommunicationRepository: ICommunicationRepository):
    Promise<CommunicationAttributes> {
    if (serviceRequest.communicationChannel === null) {
        logger.warn(`Cannot send message for ${serviceRequest.id} as no communication address was supplied.`);
        return {} as CommunicationAttributes;
    } else if (serviceRequest.communicationValid === false) {
        logger.warn(`Cannot send message for ${serviceRequest.id} as no communication address is valid.`);
        return {} as CommunicationAttributes;
    } else {
        const record = await dispatchMessage(dispatchConfig, templateConfig, CommunicationRepository);
        if (record.accepted === true) {
            serviceRequest.communicationValid = true
        } else {
            logger.warn(`Cannot send message for ${serviceRequest.id} as backend rejected the payload.`);
            serviceRequest.communicationValid = false
        }
        return record;
    }
}

export async function dispatchMessageForStaffUser(
    dispatchConfig: DispatchConfigAttributes,
    templateConfig: TemplateConfigAttributes,
    CommunicationRepository: ICommunicationRepository):
    Promise<CommunicationAttributes> {
    return await dispatchMessage(dispatchConfig, templateConfig, CommunicationRepository);
}

export async function dispatchMessage(
    dispatchConfig: DispatchConfigAttributes,
    templateConfig: TemplateConfigAttributes,
    CommunicationRepository: ICommunicationRepository):
    Promise<CommunicationAttributes> {
    let dispatchResponse: ClientResponse | Record<string, string> | Record<string, unknown>;
    let dispatchPayload: DispatchPayloadAttributes;
    let subject: string;
    let textBody: string;
    let htmlBody: string;
    if (dispatchConfig.channel === 'email') {
        subject = await loadTemplate(
            `email.${templateConfig.name}.subject`,
            templateConfig.context
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
        const errorMsg = `Unknown communication dispatch channel`;
        logger.error(errorMsg);
        throw new Error(errorMsg)
    }

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

export function findJurisdictionIdentifiers(toEmail: addrs.ParsedMailbox): string[] {
    // TODO - we are going to have to look up this in a database
    const { local } = toEmail;
    const [jurisdictionId, departmentId] = local.split('.');
    return [jurisdictionId, departmentId];
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

export function extractServiceRequestfromInboundEmail(data: InboundEmailDataToRequestAttributes, inboundEmailDomain: string):
    [ParsedServiceRequestAttributes, PublicId] {
    let firstName = '',
        lastName = '',
        email = '';
    const inputChannel = 'email';
    const { subject, to, cc, bcc, from, text, headers } = data;
    const toEmail = extractToEmail(inboundEmailDomain, headers, to, cc, bcc);
    const fromEmail = extractFromEmail(from);
    const [jurisdictionId, departmentId] = findJurisdictionIdentifiers(toEmail);
    const description = extractDescriptionFromInboundEmail(subject, text);
    const publicId = extractPublicIdFromInboundEmail(subject);
    if (fromEmail) {
        firstName = fromEmail.name || ''
        lastName = ''
        email = fromEmail.address || ''
    }
    return [{ jurisdictionId, departmentId, firstName, lastName, email, description, inputChannel }, publicId];
}

export function canSubmitterComment(submitterEmail: string, validEmails: string[]): boolean {
    if (validEmails.includes(submitterEmail)) {
        return true
    } else {
        return false;
    }
}
