import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppSettings,
    CommunicationAttributes,
    ICommunicationService,
    JurisdictionAttributes,
    RecipientAttributes,
    Repositories,
    ServiceRequestAttributes, ServiceRequestCommentAttributes, StaffUserAttributes
} from '../../types';
import { dispatchMessage, getReplyToEmail, getSendFromEmail, makeRequestURL } from './helpers';

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
            twilioFromPhone,
            inboundEmailDomain
        } = this.settings;

        const { Communication, StaffUser, EmailStatus } = this.repositories;
        const records: CommunicationAttributes[] = [];
        const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);

        const dispatchConfig = {
            channel: serviceRequest.communicationChannel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
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
                serviceRequestPublicId: serviceRequest.publicId,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                recipientName: serviceRequest.displayName as string
            }
        }
        const record = await dispatchMessage(dispatchConfig, templateConfig, Communication, EmailStatus);
        if (record) { records.push(record); }
        const [staffUsers, _count] = await StaffUser.findAll(serviceRequest.jurisdictionId);
        const admins = _.filter(staffUsers, { isAdmin: true }) as StaffUserAttributes[];
        for (const admin of admins) {
            const dispatchConfig = {
                channel: 'email',
                sendGridApiKey: sendGridApiKey as string,
                toEmail: admin.email as string,
                fromEmail: sendGridFromEmail as string,
                replyToEmail: replyToEmail as string,
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
                    serviceRequestPublicId: serviceRequest.publicId,
                    jurisdictionName: jurisdiction.name,
                    jurisdictionEmail: jurisdiction.email,
                    recipientName: admin.displayName as string
                }
            }
            const record = await dispatchMessage(
                dispatchConfig, templateConfig, Communication, EmailStatus
            );
            if (record) { records.push(record); }
        }
        return records;
    }

    async dispatchServiceRequestChangeStatus(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ): Promise<CommunicationAttributes | null> {
        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone,
            inboundEmailDomain
        } = this.settings;
        const { StaffUser, Communication, EmailStatus } = this.repositories;
        const staffUser = await StaffUser.findOne(
            serviceRequest.jurisdictionId, serviceRequest.assignedTo
        ) as StaffUserAttributes;
        const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        const dispatchConfig = {
            channel: 'email',
            sendGridApiKey: sendGridApiKey as string,
            toEmail: staffUser.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
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
                serviceRequestPublicId: serviceRequest.publicId,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                recipientName: staffUser.displayName as string
            }
        }
        const record = await dispatchMessage(dispatchConfig, templateConfig, Communication, EmailStatus);
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
            twilioFromPhone,
            inboundEmailDomain
        } = this.settings;
        const { StaffUser, Communication, EmailStatus } = this.repositories;
        const staffUser = await StaffUser.findOne(serviceRequest.jurisdictionId, serviceRequest.assignedTo) as StaffUserAttributes;
        const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        const dispatchConfig = {
            channel: 'email',
            sendGridApiKey: sendGridApiKey as string,
            toEmail: staffUser.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
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
                serviceRequestPublicId: serviceRequest.publicId,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                recipientName: staffUser.displayName as string
            }
        }
        const record = await dispatchMessage(dispatchConfig, templateConfig, Communication, EmailStatus);
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
            twilioFromPhone,
            inboundEmailDomain
        } = this.settings;
        const { Communication, StaffUser, EmailStatus } = this.repositories;
        const records: CommunicationAttributes[] = [];
        const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        const dispatchConfig = {
            channel: serviceRequest.communicationChannel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
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
                serviceRequestPublicId: serviceRequest.publicId,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                recipientName: serviceRequest.displayName as string
            }
        }
        const record = await dispatchMessage(dispatchConfig, templateConfig, Communication, EmailStatus);
        if (record) { records.push(record); }
        const [staffUsers, _count] = await StaffUser.findAll(serviceRequest.jurisdictionId);
        const admins = _.filter(staffUsers, { isAdmin: true }) as StaffUserAttributes[];
        for (const admin of admins) {
            const dispatchConfig = {
                channel: 'email',
                sendGridApiKey: sendGridApiKey as string,
                toEmail: admin.email as string,
                fromEmail: sendGridFromEmail as string,
                replyToEmail: replyToEmail as string,
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
                    serviceRequestPublicId: serviceRequest.publicId,
                    jurisdictionName: jurisdiction.name,
                    jurisdictionEmail: jurisdiction.email,
                    recipientName: admin.displayName as string
                }
            }
            const record = await dispatchMessage(
                dispatchConfig, templateConfig, Communication, EmailStatus
            );
            if (record) { records.push(record); }
        }
        return records;
    }

    async dispatchServiceRequestCommentBroadcast(
        jurisdiction: JurisdictionAttributes,
        serviceRequestComment: ServiceRequestCommentAttributes
    ): Promise<CommunicationAttributes[]> {
        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            appClientUrl,
            appClientRequestsPath,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone,
            inboundEmailDomain
        } = this.settings;
        const { Communication, StaffUser, ServiceRequest, EmailStatus } = this.repositories;
        const serviceRequest = await ServiceRequest.findOne(jurisdiction.id, serviceRequestComment.serviceRequestId);
        const records: CommunicationAttributes[] = [];
        const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        let serviceRequestCommenterName = '';
        if (serviceRequestComment.addedBy === '__SUBMITTER__') {
            serviceRequestCommenterName = serviceRequest.displayName;
        } else {
            const commenter = await StaffUser.findOne(jurisdiction.id, serviceRequestComment.addedBy as string) as StaffUserAttributes;
            serviceRequestCommenterName = commenter.displayName;
        }
        const dispatchConfig = {
            channel: serviceRequest.communicationChannel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            fromPhone: twilioFromPhone as string,
            toPhone: serviceRequest.phone as string
        }

        const recipients = [] as RecipientAttributes[];
        if (serviceRequestComment.broadcastToSubmitter) {
            recipients.push({
                email: serviceRequest.email,
                displayName: serviceRequest.displayName,
                isStaff: false,
            })
        }

        if (serviceRequestComment.broadcastToAssignee) {
            const assignee = await StaffUser.findOne(jurisdiction.id, serviceRequest.assignedTo);
            if (assignee) {
                recipients.push({
                    email: assignee.email,
                    displayName: assignee.displayName,
                    isStaff: true
                })
            }
        }

        if (serviceRequestComment.broadcastToStaff) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (jurisdiction.enforceAssignmentThroughDepartment) {
                // if department leads enabled
                // The feature does not exist yet,
                // it is in another pull request
            } else {
                const [staffUsers, _count] = await StaffUser.findAll(serviceRequest.jurisdictionId);
                const admins = _.filter(staffUsers, { isAdmin: true }) as StaffUserAttributes[];
                recipients.push(...admins.map(
                    (u) => { return { email: u.email, displayName: u.displayName, isStaff: true } },
                    admins
                ))
            }
        }

        for (const recipient of recipients) {
            const _userType = recipient.isStaff ? 'staff-user' : 'public-user';
            const templateConfig = {
                name: `service-request-comment-broadcast-${_userType}`,
                context: {
                    appName,
                    appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                    serviceRequestStatus: serviceRequest.status,
                    serviceRequestPublicId: serviceRequest.publicId,
                    serviceRequestCommenterName: serviceRequestCommenterName,
                    serviceRequestComment: serviceRequestComment.comment,
                    jurisdictionName: jurisdiction.name,
                    jurisdictionEmail: jurisdiction.email,
                    recipientName: recipient.displayName as string
                }
            }
            const record = await dispatchMessage(
                dispatchConfig, templateConfig, Communication, EmailStatus
            );
            if (record) { records.push(record); }
        }
        return records;
    }
}
