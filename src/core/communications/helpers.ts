import type { ClientResponse } from '@sendgrid/mail';
import { constants as fsConstants, promises as fs } from 'fs';
import _ from 'lodash';
import path from 'path';
import { sendEmail } from '../../email';
import logger from '../../logging';
import { sendSms } from '../../sms';
import { QueryResult } from '../../types';

async function loadTemplate(templateName: string, templateContext: Record<string, string>): Promise<string> {
    const filepath = path.resolve(`./src/core/communications/templates/${templateName}.txt`);
    try {
        await fs.access(filepath, fsConstants.R_OK | fsConstants.W_OK);
    } catch (error) {
        logger.error(error);
        throw error;
    }
    const templateBuffer = await fs.readFile(filepath);
    const templateCompile = _.template(templateBuffer.toString());
    return templateCompile({ context: templateContext });
}

export async function dispatchMessageForPublicUser(
    serviceRequest: Record<string, unknown>,
    dispatchConfig: Record<string, string>,
    templateConfig: Record<string, unknown>,
    CommunicationModel: unknown):
    Promise<QueryResult> {
    if (serviceRequest.communicationChannel === null) {
        logger.warning(`Cannot send message for ${serviceRequest.id} as no communication address was supplied.`);
        return {};
    } else if (serviceRequest.communicationValid === false) {
        logger.warning(`Cannot send message for ${serviceRequest.id} as no communication address is valid.`);
        return {};
    } else {
        const record = await dispatchMessage(dispatchConfig, templateConfig, CommunicationModel);
        // @ts-ignore
        if (record.accepted === true) {
            serviceRequest.communicationValid = true
        } else {
            logger.warning(`Cannot send message for ${serviceRequest.id} as backend rejected the payload.`);
            serviceRequest.communicationValid = false
        }
        return record;
    }
}

export async function dispatchMessageForStaffUser(
    dispatchConfig: Record<string, string>,
    templateConfig: Record<string, unknown>,
    CommunicationModel: unknown):
    Promise<QueryResult> {
    return await dispatchMessage(dispatchConfig, templateConfig, CommunicationModel);
}

export async function dispatchMessage(
    dispatchConfig: Record<string, string>,
    templateConfig: Record<string, unknown>,
    CommunicationModel: unknown):
    Promise<QueryResult> {
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
            dispatchConfig.sendGridApiKey,
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
            dispatchConfig.body,
        );
    } else {
        const errorMsg = `Unknown communication dispatch channel`;
        logger.error(errorMsg);
        throw new Error(errorMsg)
    }
    // @ts-ignore
    const record = await CommunicationModel.create({
        channel: dispatchConfig.channel,
        dispatched: true,
        dispatchPayload: dispatchConfig,
        dispatchResponse: dispatchResponse,
        // TODO: conditionally check
        accepted: true,
        delivered: true,
    })
    return record;
}