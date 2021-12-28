import type { ClientResponse } from '@sendgrid/mail';
import { constants as fsConstants, promises as fs } from 'fs';
import _ from 'lodash';
import path from 'path';
import { sendEmail } from '../../email';
import logger from '../../logging';
import { sendSms } from '../../sms';
import { CommunicationAttributes, ICommunicationRepository, ServiceRequestAttributes } from '../../types';

export async function loadTemplate(templateName: string, templateContext: Record<string, string>): Promise<string> {
    const filepath = path.resolve(`${__dirname}/templates/${templateName}.txt`);
    const [templateType, ..._rest] = templateName.split('.');
    const appendUnsubscribe = path.resolve(`${__dirname}/templates/${templateType}.unsubscribe.txt`);
    try {
        await fs.access(filepath, fsConstants.R_OK | fsConstants.W_OK);
    } catch (error) {
        logger.error(error);
        throw error;
    }
    const templateBuffer = await fs.readFile(filepath);
    const unsubscribeBuffer = await fs.readFile(appendUnsubscribe);
    const templateCompile = _.template(`${templateBuffer.toString()}${unsubscribeBuffer.toString()}`);
    return templateCompile({ context: templateContext });
}

export async function dispatchMessageForPublicUser(
    serviceRequest: ServiceRequestAttributes,
    dispatchConfig: Record<string, string>,
    templateConfig: Record<string, unknown>,
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
    dispatchConfig: Record<string, string>,
    templateConfig: Record<string, unknown>,
    CommunicationRepository: ICommunicationRepository):
    Promise<CommunicationAttributes> {
    return await dispatchMessage(dispatchConfig, templateConfig, CommunicationRepository);
}

export async function dispatchMessage(
    dispatchConfig: Record<string, string>,
    templateConfig: Record<string, unknown>,
    CommunicationRepository: ICommunicationRepository):
    Promise<CommunicationAttributes> {
    let dispatchResponse: ClientResponse | Record<string, string> | Record<string, unknown>;
    if (dispatchConfig.channel === 'email') {
        dispatchConfig.subject = await loadTemplate(
            `email.${templateConfig.name}.subject`,
            templateConfig.context as Record<string, string>
        );
        dispatchConfig.body = await loadTemplate(
            `email.${templateConfig.name}.body`,
            templateConfig.context as Record<string, string>
        );
        dispatchResponse = await sendEmail(
            dispatchConfig.apiKey,
            dispatchConfig.toEmail,
            dispatchConfig.fromEmail,
            dispatchConfig.subject,
            dispatchConfig.body
        );
    } else if (dispatchConfig.channel === 'sms') {
        dispatchConfig.body = await loadTemplate(
            `sms.${templateConfig.name}.body`,
            templateConfig.context as Record<string, string>
        );
        dispatchResponse = await sendSms(
            dispatchConfig.twilioAccountSid as string,
            dispatchConfig.twilioAuthToken as string,
            dispatchConfig.toPhone as string,
            dispatchConfig.fromPhone as string,
            dispatchConfig.body as string,
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
