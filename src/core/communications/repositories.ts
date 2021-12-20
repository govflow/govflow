import { injectable } from 'inversify';
import _ from 'lodash';
import type { CommunicationAttributes, ICommunicationRepository, ServiceRequestAttributes } from '../../types';
import { dispatchMessageForPublicUser, dispatchMessageForStaffUser } from './helpers';

@injectable()
export class CommunicationRepository implements ICommunicationRepository {

    async findByServiceRequestId(serviceRequestId: string): Promise<[CommunicationAttributes[], number]> {
        /* eslint-disable */
        //@ts-ignore
        const { Communication } = this.models;
        /* eslint-enable */
        const params = { where: { serviceRequestId } }
        const records = await Communication.findAll(params);
        return [records, records.length];
    }

    async dispatchServiceRequestNew(serviceRequest: ServiceRequestAttributes): Promise<CommunicationAttributes[]> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.repositories;
        // @ts-ignore
        const { Communication } = this.models;
        const { sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            //@ts-ignore
            twilioFromPhone } = this.settings;
        /* eslint-enable */

        const records: CommunicationAttributes[] = [];

        const dispatchConfig = {
            channel: serviceRequest.communicationChannel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendGridFromEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            fromPhone: twilioFromPhone as string,
            toPhone: serviceRequest.phone as string
        }
        const templateConfig = {
            name: 'service-request-new-public-user',
            context: {
                appName,
                requestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                recipientName: serviceRequest.displayName as string
            }
        }
        const record = await dispatchMessageForPublicUser(
            serviceRequest, dispatchConfig, templateConfig, Communication
        );
        records.push(record);
        /* eslint-disable */
        const [staffUsers, staffUsersCount] = await StaffUser.findAll(serviceRequest.jurisdictionId);
        /* eslint-enable */
        const admins = _.filter(staffUsers, { isAdmin: true });
        for (const admin of admins) {
            const dispatchConfig = {
                channel: 'email',
                apiKey: sendGridApiKey,
                toEmail: admin.email as string,
                fromEmail: sendGridFromEmail as string,
            }
            const templateConfig = {
                name: 'service-request-new-staff-user',
                context: {
                    appName,
                    requestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                    recipientName: admin.displayName as string
                }
            }
            const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
            records.push(record);
        }
        return records;
    }

    async dispatchServiceRequestChangedStatus(
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.repositories;
        // @ts-ignore
        const { Communication } = this.models;
        /* eslint-enable */
        /* eslint-disable */
        //@ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl, appClientRequestsPath } = this.settings;
        /* eslint-enable */
        const staffUser = await StaffUser.findOne(serviceRequest.jurisdictionId, serviceRequest.assignedTo);
        const dispatchConfig = {
            channel: 'email',
            apiKey: sendGridApiKey,
            toEmail: staffUser.email as string,
            fromEmail: sendGridFromEmail as string,
        }
        const templateConfig = {
            name: 'service-request-changed-status-staff-user',
            context: {
                appName,
                requestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                recipientName: staffUser.displayName as string
            }
        }
        const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
        return record;
    }

    async dispatchServiceRequestChangedAssignee(
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.repositories;
        // @ts-ignore
        const { Communication } = this.models;
        /* eslint-enable */
        /* eslint-disable */
        //@ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl, appClientRequestsPath } = this.settings;
        const staffUser = await StaffUser.findOne(serviceRequest.jurisdictionId, serviceRequest.assignedTo);
        const dispatchConfig = {
            channel: 'email',
            apiKey: sendGridApiKey,
            toEmail: staffUser.email as string,
            fromEmail: sendGridFromEmail as string,
        }
        const templateConfig = {
            name: 'service-request-changed-assignee-staff-user',
            context: {
                appName,
                requestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                recipientName: staffUser.displayName as string
            }
        }
        const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
        return record;
    }

    async dispatchServiceRequestClosed(serviceRequest: ServiceRequestAttributes): Promise<CommunicationAttributes[]> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser } = this.repositories;
        // @ts-ignore
        const { Communication } = this.models;
        // @ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl, appClientRequestsPath } = this.settings;
        /* eslint-enable */
        const records: CommunicationAttributes[] = [];

        const dispatchConfig = {
            channel: serviceRequest.communicationChannel as string,
            apiKey: sendGridApiKey,
            toEmail: serviceRequest.email as string,
            fromEmail: sendGridFromEmail as string,
        }
        const templateConfig = {
            name: 'service-request-closed-public-user',
            context: {
                appName,
                requestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                recipientName: serviceRequest.displayName as string
            }
        }
        const record = await dispatchMessageForPublicUser(
            serviceRequest, dispatchConfig, templateConfig, Communication
        );
        records.push(record);
        /* eslint-disable */
        const [staffUsers, staffUsersCount] = await StaffUser.findAll(
            /* eslint-enable */
            serviceRequest.jurisdictionId
        );
        const admins = _.filter(staffUsers, { isAdmin: true });
        for (const admin of admins) {
            const dispatchConfig = {
                channel: 'email',
                apiKey: sendGridApiKey,
                toEmail: admin.email as string,
                fromEmail: sendGridFromEmail as string,
            }
            const templateConfig = {
                name: 'service-request-closed-staff-user',
                context: {
                    appName,
                    requestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                    recipientName: admin.displayName as string
                }
            }
            const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
            records.push(record);
        }
        return records;
    }
}
