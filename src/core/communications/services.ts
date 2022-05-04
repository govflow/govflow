import { inject, injectable } from 'inversify';
import _ from 'lodash';
import logger from '../../logging';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppSettings,
    CommunicationAttributes,
    DispatchConfigAttributes,
    IInboundMessageService,
    InboundEmailDataAttributes,
    InboundMapAttributes,
    IOutboundMessageService,
    JurisdictionAttributes,
    RecipientAttributes,
    Repositories,
    ServiceRequestAttributes, ServiceRequestCommentAttributes, ServiceRequestInstance, StaffUserAttributes
} from '../../types';
import { canSubmitterComment, dispatchMessage, extractServiceRequestfromInboundEmail, getReplyToEmail, getSendFromEmail, makeRequestURL } from './helpers';

@injectable()
export class OutboundMessageService implements IOutboundMessageService {

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
                jurisdictionReplyToServiceRequestEnabled: jurisdiction.replyToServiceRequestEnabled,
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
                    jurisdictionReplyToServiceRequestEnabled: jurisdiction.replyToServiceRequestEnabled,
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
                jurisdictionReplyToServiceRequestEnabled: jurisdiction.replyToServiceRequestEnabled,
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
            name: 'service-request-changed-assignee-staff-user',
            context: {
                appName,
                appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                serviceRequestStatus: serviceRequest.status,
                serviceRequestPublicId: serviceRequest.publicId,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                jurisdictionReplyToServiceRequestEnabled: jurisdiction.replyToServiceRequestEnabled,
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
                jurisdictionReplyToServiceRequestEnabled: jurisdiction.replyToServiceRequestEnabled,
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
                    jurisdictionReplyToServiceRequestEnabled: jurisdiction.replyToServiceRequestEnabled,
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

    async dispatchServiceRequestComment(
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
            const commenter = await StaffUser.findOne(
                jurisdiction.id, serviceRequestComment.addedBy as string
            ) as StaffUserAttributes;
            if (commenter) {
                serviceRequestCommenterName = commenter.displayName;
            } else {
                serviceRequestCommenterName = 'System';
            }
        }
        // not using serviceRequestCommentContext to submitters
        let serviceRequestCommentContext = '';
        if (serviceRequestComment.broadcastToSubmitter) {
            serviceRequestCommentContext = `<br /><br />Message sent to the request submitter:<br /><br />`;
        }
        const dispatchConfig = {
            channel: serviceRequest.communicationChannel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: '', // populated per recipient
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            fromPhone: twilioFromPhone as string,
            toPhone: serviceRequest.phone as string
        } as DispatchConfigAttributes

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
            const [staffUsers, _count] = await StaffUser.findAll(serviceRequest.jurisdictionId);
            let staffRecipients = _.filter(staffUsers, { isAdmin: true }) as StaffUserAttributes[];

            if (jurisdiction.filterBroadcastsByDepartment && serviceRequest.departmentId) {
                const departmentMap = await StaffUser.getDepartmentMap(jurisdiction.id);
                const _lookup = _.map(
                    _.filter(departmentMap, { departmentId: serviceRequest.departmentId, isLead: true }),
                    m => m.staffUserId
                );
                staffRecipients = _.filter(staffUsers, s => _lookup.includes(s.id));
            }

            recipients.push(...staffRecipients.map(
                s => { return { email: s.email, displayName: s.displayName, isStaff: true } }
            ))
        }

        for (const recipient of recipients) {
            dispatchConfig.toEmail = recipient.email;
            const _userType = recipient.isStaff ? 'staff-user' : 'public-user';
            const templateConfig = {
                name: `service-request-comment-broadcast-${_userType}`,
                context: {
                    appName,
                    appRequestUrl: makeRequestURL(appClientUrl, appClientRequestsPath, serviceRequest.id),
                    serviceRequestStatus: serviceRequest.status,
                    serviceRequestPublicId: serviceRequest.publicId,
                    serviceRequestCommenterName: serviceRequestCommenterName,
                    serviceRequestCommentContext: serviceRequestCommentContext,
                    serviceRequestComment: serviceRequestComment.comment,
                    jurisdictionName: jurisdiction.name,
                    jurisdictionEmail: jurisdiction.email,
                    jurisdictionReplyToServiceRequestEnabled: jurisdiction.replyToServiceRequestEnabled,
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

@injectable()
export class InboundMessageService implements IInboundMessageService {

    repositories: Repositories
    settings: AppSettings

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppSettings) settings: AppSettings,) {
        this.repositories = repositories;
        this.settings = settings;
    }

    async createServiceRequest(inboundEmailData: InboundEmailDataAttributes):
        Promise<[ServiceRequestAttributes, boolean]> {
        const { ServiceRequest, StaffUser, InboundMap } = this.repositories;
        const { subject, to, cc, bcc, from, text, headers } = inboundEmailData;
        const { inboundEmailDomain } = this.settings;
        let intermediateRecord: ServiceRequestAttributes;
        let recordCreated = true;
        const [cleanedData, publicId] = await extractServiceRequestfromInboundEmail(
            { subject, to, cc, bcc, from, text, headers }, inboundEmailDomain, InboundMap
        );
        if (publicId || cleanedData.serviceRequestId) {
            const [staffUsers, _count] = await StaffUser.findAll(
                cleanedData.jurisdictionId, { whereParams: { isAdmin: true } }
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const staffEmails = staffUsers.map((user: StaffUserInstance) => { return user.email }) as string[];
            let addedBy = '__SUBMITTER__';
            if (staffEmails.includes(cleanedData.email)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                addedBy = _.find(staffUsers, (u) => { return u.email === cleanedData.email }).id
            }
            if (cleanedData.serviceRequestId) {
                intermediateRecord = await ServiceRequest.findOne(
                    cleanedData.jurisdictionId, cleanedData.serviceRequestId
                );
            } else {
                intermediateRecord = await ServiceRequest.findOneByPublicId(
                    cleanedData.jurisdictionId, publicId as unknown as string
                );
            }
            recordCreated = false;
            const validEmails = [...staffEmails, intermediateRecord.email];
            const canComment = canSubmitterComment(cleanedData.email, validEmails);
            if (canComment && intermediateRecord) {
                const comment = {
                    comment: cleanedData.description,
                    addedBy,
                    // TODO: These are hard coded for now, but should really be made configurable via the InboundMap
                    // or some other means. The hardcoded assumption here is that inbound messages
                    // will be broadcast to staff and assignees
                    broadcastToStaff: true,
                    broadcastToAssignee: true,
                };
                await ServiceRequest.createComment(cleanedData.jurisdictionId, intermediateRecord.id, comment);
            } else {
                const dataToLog = { message: 'Invalid Comment Submitter.' }
                logger.error(dataToLog);
                throw new Error(dataToLog.message);
            }
        } else {
            intermediateRecord = await ServiceRequest.create(cleanedData) as ServiceRequestInstance;
        }
        // requery to ensure we have all relations
        const record = await ServiceRequest.findOne(cleanedData.jurisdictionId, intermediateRecord.id);
        return [record, recordCreated];
    }

    async createMap(data: InboundMapAttributes): Promise<InboundMapAttributes> {
        const { InboundMap } = this.repositories;
        const record = await InboundMap.create(data) as InboundMapAttributes;
        return record;
    }

}
