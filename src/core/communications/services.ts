import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppSettings,
    CommunicationAttributes,
    ICommunicationService,
    JurisdictionAttributes,
    Repositories,
    ServiceRequestAttributes,
    StaffUserAttributes
} from '../../types';
import { dispatchMessageForPublicUser, dispatchMessageForStaffUser, makeRequestURL } from './helpers';

@injectable()
export class CommunicationService implements ICommunicationService {

    repositories: Repositories
    settings: AppSettings

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppSettings) settings: AppSettings,) {
            this.repositories = repositories;
            this.settings = settings;
    }

    async dispatchServiceRequestCreate(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes[]> {
        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone
        } = this.settings;

        const { Communication, StaffUser } = this.repositories;

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
                appName: appName as string,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                recipientName: serviceRequest.displayName as string
            }
        }
        const record = await dispatchMessageForPublicUser(
            serviceRequest, dispatchConfig, templateConfig, Communication
        );
        records.push(record);
        const [staffUsers, _count] = await StaffUser.findAll(serviceRequest.jurisdictionId);
        const admins = _.filter(staffUsers, { isAdmin: true }) as StaffUserAttributes[];
        for (const admin of admins) {
            const dispatchConfig = {
                channel: 'email',
                sendGridApiKey: sendGridApiKey as string,
                toEmail: admin.email as string,
                fromEmail: sendGridFromEmail as string,
                twilioAccountSid: twilioAccountSid as string,
                twilioAuthToken: twilioAuthToken as string,
                fromPhone: twilioFromPhone as string,
                toPhone: serviceRequest.phone as string
            }
            const templateConfig = {
                name: 'service-request-new-staff-user',
                context: {
                    appName,
                    appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                    serviceRequestStatus: serviceRequest.status,
                    jurisdictionName: jurisdiction.name,
                    jurisdictionEmail: jurisdiction.email,
                    recipientName: admin.displayName as string
                }
            }
            const record = await dispatchMessageForStaffUser(
                dispatchConfig, templateConfig, Communication
            );
            records.push(record);
        }
        return records;
    }

    async dispatchServiceRequestChangeStatus(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes> {
        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone
        } = this.settings;
        const { StaffUser, Communication } = this.repositories;
        const staffUser = await StaffUser.findOne(
            serviceRequest.jurisdictionId, serviceRequest.assignedTo
        );
        const dispatchConfig = {
            channel: 'email',
            sendGridApiKey: sendGridApiKey as string,
            toEmail: staffUser.email as string,
            fromEmail: sendGridFromEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            fromPhone: twilioFromPhone as string,
            toPhone: serviceRequest.phone as string
        }
        const templateConfig = {
            name: 'service-request-changed-status-staff-user',
            context: {
                appName,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                recipientName: staffUser.displayName as string
            }
        }
        const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
        return record;
    }

    async dispatchServiceRequestChangeAssignee(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes | null> {

        // early return if the service request has been unassigned
        if (_.isNil(serviceRequest.assignedTo)) { return null; }

        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone
        } = this.settings;
        const { StaffUser, Communication } = this.repositories;
        const staffUser = await StaffUser.findOne(serviceRequest.jurisdictionId, serviceRequest.assignedTo);
        const dispatchConfig = {
            channel: 'email',
            sendGridApiKey: sendGridApiKey as string,
            toEmail: staffUser.email as string,
            fromEmail: sendGridFromEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            fromPhone: twilioFromPhone as string,
            toPhone: serviceRequest.phone as string
        }
        const templateConfig = {
            name: 'service-request-changed-assignee-staff-user',
            context: {
                appName,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                recipientName: staffUser.displayName as string
            }
        }
        const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
        return record;
    }

    async dispatchServiceRequestClosed(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes[]> {

        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone
        } = this.settings;
        const { Communication, StaffUser } = this.repositories;
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
            name: 'service-request-closed-public-user',
            context: {
                appName,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                serviceRequestStatus: serviceRequest.status,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                recipientName: serviceRequest.displayName as string
            }
        }
        const record = await dispatchMessageForPublicUser(
            serviceRequest, dispatchConfig, templateConfig, Communication
        );
        records.push(record);
        const [staffUsers, _count] = await StaffUser.findAll(serviceRequest.jurisdictionId);
        const admins = _.filter(staffUsers, { isAdmin: true }) as StaffUserAttributes[];
        for (const admin of admins) {
            const dispatchConfig = {
                channel: 'email',
                sendGridApiKey: sendGridApiKey as string,
                toEmail: admin.email as string,
                fromEmail: sendGridFromEmail as string,
                twilioAccountSid: twilioAccountSid as string,
                twilioAuthToken: twilioAuthToken as string,
                fromPhone: twilioFromPhone as string,
                toPhone: serviceRequest.phone as string
            }
            const templateConfig = {
                name: 'service-request-closed-staff-user',
                context: {
                    appName,
                    appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                    serviceRequestStatus: serviceRequest.status,
                    jurisdictionName: jurisdiction.name,
                    jurisdictionEmail: jurisdiction.email,
                    recipientName: admin.displayName as string
                }
            }
            const record = await dispatchMessageForStaffUser(dispatchConfig, templateConfig, Communication);
            records.push(record);
        }
        return records;
    }
}
