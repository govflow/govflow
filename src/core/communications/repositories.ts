import { injectable } from 'inversify';
import _ from 'lodash';
import { sendEmail } from '.';
import type { ICommunicationRepository, IterableQueryResult, QueryResult } from '../../types';
import {
    serviceRequestPublicUserClosedEmailBody,
    serviceRequestPublicUserClosedEmailSubject,
    serviceRequestPublicUserNewEmailBody,
    serviceRequestPublicUserNewEmailSubject,
    serviceRequestStaffUserChangedAssigneeEmailBody,
    serviceRequestStaffUserChangedAssigneeEmailSubject,
    serviceRequestStaffUserChangedStatusEmailBody,
    serviceRequestStaffUserChangedStatusEmailSubject,
    serviceRequestStaffUserClosedEmailBody,
    serviceRequestStaffUserClosedEmailSubject,
    serviceRequestStaffUserNewEmailBody,
    serviceRequestStaffUserNewEmailSubject
} from './templates';

@injectable()
export class CommunicationRepository implements ICommunicationRepository {

    async dispatchServiceRequestNew(serviceRequest: Record<string, unknown>): Promise<IterableQueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.dependencies;
        // @ts-ignore
        const { Communication } = this.models;
        /* eslint-enable */
        const records: IterableQueryResult = [];

        // TO PUBLIC USER
        //@ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl } = this.settings;
        const toEmail = serviceRequest.email;
        const recipientName = serviceRequest.displayName as string;
        const templateContext = { appName, appClientUrl, recipientName };
        /* eslint-enable */
        const dispatchPayload = {
            apiKey: sendGridApiKey,
            toEmail: toEmail as string,
            fromEmail: sendGridFromEmail as string,
            subject: serviceRequestPublicUserNewEmailSubject(templateContext),
            body: serviceRequestPublicUserNewEmailBody(templateContext),
        }
        const response = await sendEmail(
            dispatchPayload.apiKey,
            dispatchPayload.toEmail,
            dispatchPayload.fromEmail,
            dispatchPayload.subject,
            dispatchPayload.body
        );
        const record = await Communication.create({
            channel: 'email',
            dispatched: true,
            dispatchPayload: dispatchPayload,
            dispatchResponse: response,
            // TODO: conditionally check
            accepted: true,
            delivered: true,
        })
        records.push(record);

        // TO STAFF USERS
        const [staffUsers, staffUsersCount] = await StaffUser.findAll(serviceRequest.jurisdictionId);
        const admins = _.filter(staffUsers, { isAdmin: true });
        for (const admin of admins) {
            /* eslint-disable */
            //@ts-ignore
            const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl } = this.settings;
            const toEmail = admin.email;
            const recipientName = admin.displayName;
            const templateContext = { appName, appClientUrl, recipientName };
            /* eslint-enable */
            const dispatchPayload = {
                apiKey: sendGridApiKey,
                toEmail: toEmail,
                fromEmail: sendGridFromEmail as string,
                subject: serviceRequestStaffUserNewEmailSubject(templateContext),
                body: serviceRequestStaffUserNewEmailBody(templateContext),
            }
            const response = await sendEmail(
                dispatchPayload.apiKey,
                dispatchPayload.toEmail,
                dispatchPayload.fromEmail,
                dispatchPayload.subject,
                dispatchPayload.body
            );
            const record = await Communication.create({
                channel: 'email',
                dispatched: true,
                dispatchPayload: dispatchPayload,
                dispatchResponse: response,
                // TODO: conditionally check
                accepted: true,
                delivered: true,
            })
            records.push(record);
        }
        return records;
    }

    async dispatchServiceRequestChangedStatus(serviceRequest: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.dependencies;
        // @ts-ignore
        const { Communication } = this.models;
        /* eslint-enable */
        /* eslint-disable */
        //@ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl } = this.settings;
        const staffUser = await StaffUser.findOne(serviceRequest.assignedTo);
        const toEmail = staffUser.email;
        const recipientName = staffUser.displayName;
        const templateContext = { appName, appClientUrl, recipientName };
        /* eslint-enable */
        const dispatchPayload = {
            apiKey: sendGridApiKey,
            toEmail: toEmail,
            fromEmail: sendGridFromEmail as string,
            subject: serviceRequestStaffUserChangedStatusEmailSubject(templateContext),
            body: serviceRequestStaffUserChangedStatusEmailBody(templateContext),
        }
        const response = await sendEmail(
            dispatchPayload.apiKey,
            dispatchPayload.toEmail,
            dispatchPayload.fromEmail,
            dispatchPayload.subject,
            dispatchPayload.body
        );
        const record = await Communication.create({
            channel: 'email',
            dispatched: true,
            dispatchPayload: dispatchPayload,
            dispatchResponse: response,
            // TODO: conditionally check
            accepted: true,
            delivered: true,
        })
        return record;
    }
    async dispatchServiceRequestChangedAssignee(serviceRequest: Record<string, unknown>): Promise<QueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.dependencies;
        // @ts-ignore
        const { Communication } = this.models;
        /* eslint-enable */
        /* eslint-disable */
        //@ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl } = this.settings;
        const staffUser = await StaffUser.findOne(serviceRequest.assignedTo);
        const toEmail = staffUser.email;
        const recipientName = staffUser.displayName;
        const templateContext = { appName, appClientUrl, recipientName };
        /* eslint-enable */
        const dispatchPayload = {
            apiKey: sendGridApiKey,
            toEmail: toEmail,
            fromEmail: sendGridFromEmail as string,
            subject: serviceRequestStaffUserChangedAssigneeEmailSubject(templateContext),
            body: serviceRequestStaffUserChangedAssigneeEmailBody(templateContext),
        }
        const response = await sendEmail(
            dispatchPayload.apiKey,
            dispatchPayload.toEmail,
            dispatchPayload.fromEmail,
            dispatchPayload.subject,
            dispatchPayload.body
        );
        const record = await Communication.create({
            channel: 'email',
            dispatched: true,
            dispatchPayload: dispatchPayload,
            dispatchResponse: response,
            // TODO: conditionally check
            accepted: true,
            delivered: true,
        })
        return await Communication.findOne(toEmail);
    }

    async dispatchServiceRequestClosed(serviceRequest: Record<string, unknown>): Promise<IterableQueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.dependencies;
        // @ts-ignore
        const { Communication } = this.models;
        // @ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl } = this.settings;
        /* eslint-enable */
        const records: IterableQueryResult = [];

        // TO PUBLIC USER
        const toEmail = serviceRequest.email;
        const recipientName = serviceRequest.displayName as string;
        const templateContext = { appName, appClientUrl, recipientName };
        /* eslint-enable */
        const dispatchPayload = {
            apiKey: sendGridApiKey,
            toEmail: toEmail as string,
            fromEmail: sendGridFromEmail as string,
            subject: serviceRequestPublicUserClosedEmailSubject(templateContext),
            body: serviceRequestPublicUserClosedEmailBody(templateContext),
        }
        const response = await sendEmail(
            dispatchPayload.apiKey,
            dispatchPayload.toEmail,
            dispatchPayload.fromEmail,
            dispatchPayload.subject,
            dispatchPayload.body
        );
        const record = await Communication.create({
            channel: 'email',
            dispatched: true,
            dispatchPayload: dispatchPayload,
            dispatchResponse: response,
            // TODO: conditionally check
            accepted: true,
            delivered: true,
        })
        records.push(record);

        // TO STAFF USERS
        const [staffUsers, staffUsersCount] = await StaffUser.findAll(serviceRequest.jurisdictionId);
        const admins = _.filter(staffUsers, { isAdmin: true });
        for (const admin of admins) {
            /* eslint-disable */
            //@ts-ignore
            const toEmail = admin.email;
            const recipientName = admin.displayName;
            const templateContext = { appName, appClientUrl, recipientName };
            /* eslint-enable */
            const dispatchPayload = {
                apiKey: sendGridApiKey,
                toEmail: toEmail,
                fromEmail: sendGridFromEmail as string,
                subject: serviceRequestStaffUserClosedEmailSubject(templateContext),
                body: serviceRequestStaffUserClosedEmailBody(templateContext),
            }
            const response = await sendEmail(
                dispatchPayload.apiKey,
                dispatchPayload.toEmail,
                dispatchPayload.fromEmail,
                dispatchPayload.subject,
                dispatchPayload.body
            );
            const record = await Communication.create({
                channel: 'email',
                dispatched: true,
                dispatchPayload: dispatchPayload,
                dispatchResponse: response,
                // TODO: conditionally check
                accepted: true,
                delivered: true,
            })
            records.push(record);
        }
        return records;
    }
}
