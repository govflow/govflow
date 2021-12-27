import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppSettings, CommunicationAttributes, CommunicationCreateAttributes, CommunicationInstance,
    ICommunicationRepository,
    JurisdictionAttributes, Models, ServiceRequestAttributes
} from '../../types';
import { dispatchMessageForPublicUser, dispatchMessageForStaffUser } from './helpers';

@injectable()
export class CommunicationRepository implements ICommunicationRepository {

    models: Models;
    settings: AppSettings;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppSettings) settings: AppSettings,
    ) {
        this.models = models;
        this.settings = settings
    }

    async create(data: CommunicationCreateAttributes): Promise<CommunicationAttributes> {
        const { Communication } = this.models;
        return await Communication.create(data) as CommunicationInstance;
    }

    async findByServiceRequestId(serviceRequestId: string): Promise<[CommunicationAttributes[], number]> {
        const { Communication } = this.models;
        const params = { where: { serviceRequestId } }
        const records = await Communication.findAll(params);
        return [records as CommunicationInstance[], records.length];
    }

    async dispatchServiceRequestCreate(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes[]> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser, Communication } = this.repositories;
        // @ts-ignore
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
                appRequestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: jurisdiction.id,
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
                apiKey: sendGridApiKey as string,
                toEmail: admin.email as string,
                fromEmail: sendGridFromEmail as string,
            }
            const templateConfig = {
                name: 'service-request-new-staff-user',
                context: {
                    appName,
                    appRequestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                    serviceRequestStatus: serviceRequest.status,
                    jurisdictionName: jurisdiction.id,
                    recipientName: admin.displayName as string
                }
            }
            const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
            records.push(record);
        }
        return records;
    }

    async dispatchServiceRequestChangeStatus(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser, Communication } = this.repositories;
        // @ts-ignore
        /* eslint-enable */
        /* eslint-disable */
        //@ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl, appClientRequestsPath } = this.settings;
        /* eslint-enable */
        const staffUser = await StaffUser.findOne(serviceRequest.jurisdictionId, serviceRequest.assignedTo);
        const dispatchConfig = {
            channel: 'email',
            apiKey: sendGridApiKey as string,
            toEmail: staffUser.email as string,
            fromEmail: sendGridFromEmail as string,
        }
        const templateConfig = {
            name: 'service-request-changed-status-staff-user',
            context: {
                appName,
                appRequestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: jurisdiction.id,
                recipientName: staffUser.displayName as string
            }
        }
        const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
        return record;
    }

    async dispatchServiceRequestChangeAssignee(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser, Communication } = this.repositories;
        // @ts-ignore
        /* eslint-enable */
        /* eslint-disable */
        //@ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl, appClientRequestsPath } = this.settings;
        const staffUser = await StaffUser.findOne(serviceRequest.jurisdictionId, serviceRequest.assignedTo);
        const dispatchConfig = {
            channel: 'email',
            apiKey: sendGridApiKey as string,
            toEmail: staffUser.email as string,
            fromEmail: sendGridFromEmail as string,
        }
        const templateConfig = {
            name: 'service-request-changed-assignee-staff-user',
            context: {
                appName,
                appRequestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: jurisdiction.id,
                recipientName: staffUser.displayName as string
            }
        }
        const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
        return record;
    }

    async dispatchServiceRequestClosed(jurisdiction: JurisdictionAttributes, serviceRequest: ServiceRequestAttributes): Promise<CommunicationAttributes[]> {
        /* eslint-disable */
        //@ts-ignore
        const { StaffUser, Communication } = this.repositories;
        // @ts-ignore
        // @ts-ignore
        const { sendGridApiKey, sendGridFromEmail, appName, appClientUrl, appClientRequestsPath } = this.settings;
        /* eslint-enable */
        const records: CommunicationAttributes[] = [];

        const dispatchConfig = {
            channel: serviceRequest.communicationChannel as string,
            apiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendGridFromEmail as string,
        }
        const templateConfig = {
            name: 'service-request-closed-public-user',
            context: {
                appName,
                appRequestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: jurisdiction.id,
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
                apiKey: sendGridApiKey as string,
                toEmail: admin.email as string,
                fromEmail: sendGridFromEmail as string,
            }
            const templateConfig = {
                name: 'service-request-closed-staff-user',
                context: {
                    appName,
                    appRequestUrl: `${appClientUrl}${appClientRequestsPath}/${serviceRequest.id}`,
                    serviceRequestStatus: serviceRequest.status,
                    jurisdictionName: jurisdiction.id,
                    recipientName: admin.displayName as string
                }
            }
            const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
            records.push(record);
        }
        return records;
    }
}
