import type { ClientResponse } from '@sendgrid/mail';
import { constants as fsConstants, promises as fs } from 'fs';
import _ from 'lodash';
import path from 'path';
import { sendEmail } from '../../email';
import logger from '../../logging';
import { sendSms } from '../../sms';
import { CommunicationAttributes, DispatchConfigAttributes, DispatchPayloadAttributes, ICommunicationRepository, ServiceRequestAttributes, TemplateConfigAttributes, TemplateConfigContextAttributes } from '../../types';

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
        appendString = `\n\n${unsubscribeBuffer.toString()}`;
    } else {
        appendString = '';
    }

    const templateCompile = _.template(`${templateString}${appendString}`);
    return templateCompile({ context: templateContext });
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
    let body: string;
    if (dispatchConfig.channel === 'email') {
        subject = await loadTemplate(
            `email.${templateConfig.name}.subject`,
            templateConfig.context
        );
        body = await loadTemplate(
            `email.${templateConfig.name}.body`,
            templateConfig.context
        );
        dispatchPayload = Object.assign({}, dispatchConfig, { subject, body })
        dispatchResponse = await sendEmail(
            dispatchPayload.sendGridApiKey,
            dispatchPayload.toEmail,
            dispatchPayload.fromEmail,
            dispatchPayload.subject as string,
            dispatchPayload.body
        );
    } else if (dispatchConfig.channel === 'sms') {
        body = await loadTemplate(
            `sms.${templateConfig.name}.body`,
            templateConfig.context,
            true
        );
        dispatchPayload = Object.assign({}, dispatchConfig, { body })
        dispatchResponse = await sendSms(
            dispatchPayload.twilioAccountSid as string,
            dispatchPayload.twilioAuthToken as string,
            dispatchPayload.toPhone as string,
            dispatchPayload.fromPhone as string,
            dispatchPayload.body as string,
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
