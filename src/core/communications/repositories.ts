import { injectable } from 'inversify';
import _ from 'lodash';
import { sendEmail } from '.';
import type { ICommunicationRepository, IterableQueryResult, QueryResult } from '../../types';
import {
    serviceRequestPublicUserClosedEmailBody,
    serviceRequestPublicUserClosedEmailSubject,
    serviceRequestStaffUserChangedAssigneeEmailBody,
    serviceRequestStaffUserChangedAssigneeEmailSubject,
    serviceRequestStaffUserChangedStatusEmailBody,
    serviceRequestStaffUserChangedStatusEmailSubject, serviceRequestStaffUserNewEmailBody, serviceRequestStaffUserNewEmailSubject
} from './templates';

@injectable()
export class CommunicationRepository implements ICommunicationRepository {

    async dispatchForServiceRequestNew(serviceRequest: Record<string, unknown>): Promise<IterableQueryResult> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.dependencies;
        // @ts-ignore
        const { Communication } = this.models;
        /* eslint-enable */
        const records: IterableQueryResult = [];
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

}