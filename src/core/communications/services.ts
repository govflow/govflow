import { inject, injectable } from 'inversify';
import _ from 'lodash';
import logger from '../../logging';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppConfig,
    CommunicationAttributes,
    DispatchConfigAttributes,
    IInboundMessageService,
    InboundEmailDataAttributes,
    InboundMapAttributes,
    InboundSmsDataAttributes,
    IOutboundMessageService,
    JurisdictionAttributes,
    ParsedServiceRequestAttributes,
    PublicId,
    RecipientAttributes,
    Repositories,
    ServiceRequestAttributes, ServiceRequestCommentAttributes, ServiceRequestInstance, StaffUserAttributes
} from '../../types';
import { canSubmitterComment, dispatchMessage, extractServiceRequestfromInboundEmail, extractServiceRequestfromInboundSms, getReplyToEmail, getSendFromEmail, makeRequestURL } from './helpers';

@injectable()
export class OutboundMessageService implements IOutboundMessageService {

    repositories: Repositories
    config: AppConfig

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppConfig) config: AppConfig,) {
        this.repositories = repositories;
        this.config = config;
    }

    async getStaffRecipients(jurisdiction: JurisdictionAttributes, departmentId: string | null) {
        const { staffUserRepository } = this.repositories;
        const [staffUsers, _count] = await staffUserRepository.findAll(jurisdiction.id);
        let staffRecipients = _.filter(staffUsers, { isAdmin: true }) as StaffUserAttributes[];

        if (jurisdiction.filterBroadcastsByDepartment && departmentId) {
            const departmentMap = await staffUserRepository.getDepartmentMap(jurisdiction.id);
            const _lookup = _.map(
                _.filter(departmentMap, { departmentId: departmentId, isLead: true }),
                m => m.staffUserId
            );
            staffRecipients = _.filter(staffUsers, s => _lookup.includes(s.id));
        }

        return staffRecipients.map(
            s => { return { email: s.email, displayName: s.displayName, isStaff: true } }
        )
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
        } = this.config;

        const { communicationRepository, emailStatusRepository } = this.repositories;
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
        const record = await dispatchMessage(
            dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
        );
        if (record) { records.push(record); }

        const staffRecipients = await this.getStaffRecipients(jurisdiction, serviceRequest.departmentId);
        for (const staff of staffRecipients) {
            const dispatchConfig = {
                channel: 'email',
                sendGridApiKey: sendGridApiKey as string,
                toEmail: staff.email as string,
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
                    recipientName: staff.displayName as string
                }
            }
            const record = await dispatchMessage(
                dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
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
        } = this.config;
        const { staffUserRepository, communicationRepository, emailStatusRepository } = this.repositories;

        const staffUser = await staffUserRepository.findOne(
            serviceRequest.jurisdictionId, serviceRequest.assignedTo
        );
        // early return if no matching staff user
        if (!staffUser) { return null; }

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
        const record = await dispatchMessage(
            dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
        );
        return record;
    }

    async dispatchServiceRequestChangeAssignee(
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
        } = this.config;
        const { staffUserRepository, communicationRepository, emailStatusRepository } = this.repositories;

        // early return if the service request has been unassigned
        if (!serviceRequest.assignedTo) { return null; }

        const staffUser = await staffUserRepository.findOne(
            serviceRequest.jurisdictionId, serviceRequest.assignedTo
        );
        // early return if no matching staff user
        if (!staffUser) { return null; }

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
        const record = await dispatchMessage(
            dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
        );
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
        } = this.config;
        const { communicationRepository, emailStatusRepository } = this.repositories;
        const records: CommunicationAttributes[] = [];
        const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);

        if (jurisdiction.broadcastToSubmitterOnRequestClosed) {
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
            const record = await dispatchMessage(
                dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
            );
            if (record) { records.push(record); }
        }

        const staffRecipients = await this.getStaffRecipients(jurisdiction, serviceRequest.departmentId);
        for (const staff of staffRecipients) {
            const dispatchConfig = {
                channel: 'email',
                sendGridApiKey: sendGridApiKey as string,
                toEmail: staff.email as string,
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
                    recipientName: staff.displayName as string
                }
            }
            const record = await dispatchMessage(
                dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
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
        } = this.config;
        const {
            communicationRepository,
            staffUserRepository,
            emailStatusRepository,
            serviceRequestRepository
        } = this.repositories;
        const serviceRequest = await serviceRequestRepository.findOne(
            jurisdiction.id, serviceRequestComment.serviceRequestId
        );
        const records: CommunicationAttributes[] = [];
        const replyToEmail = getReplyToEmail(
            serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail
        );
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        let serviceRequestCommenterName = '';
        if (serviceRequestComment.addedBy === '__SUBMITTER__') {
            serviceRequestCommenterName = serviceRequest.displayName;
        } else {
            const commenter = await staffUserRepository.findOne(
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
            const assignee = await staffUserRepository.findOne(jurisdiction.id, serviceRequest.assignedTo);
            if (assignee) {
                recipients.push({
                    email: assignee.email,
                    displayName: assignee.displayName,
                    isStaff: true
                })
            }
        }

        if (serviceRequestComment.broadcastToStaff) {
            const staffRecipients = await this.getStaffRecipients(jurisdiction, serviceRequest.departmentId);
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
                dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
            );
            if (record) { records.push(record); }
        }
        return records;
    }
}

@injectable()
export class InboundMessageService implements IInboundMessageService {

    repositories: Repositories
    config: AppConfig

    constructor(
        @inject(appIds.Repositories) repositories: Repositories,
        @inject(appIds.AppConfig) config: AppConfig,) {
        this.repositories = repositories;
        this.config = config;
    }

    inboundIsEmail(data: any): data is InboundEmailDataAttributes {
        const valids = ['to', 'from', 'subject', 'text', 'envelope', 'dkim', 'SPF'];
        const properties = Object.keys(data)
        return valids.every(value => properties.includes(value))
    }

    inboundIsSms(data: any): data is InboundSmsDataAttributes {
        const valids = ['To', 'From', 'Body', 'MessageSid', 'AccountSid', 'SmsMessageSid', 'MessagingServiceSid'];
        const properties = Object.keys(data)
        return valids.every(value => properties.includes(value))
    }

    async createServiceRequest(inboundData: InboundEmailDataAttributes | InboundSmsDataAttributes):
        Promise<[ServiceRequestAttributes, boolean]> {
        const { serviceRequestRepository, staffUserRepository, inboundMapRepository } = this.repositories;

        const { inboundEmailDomain } = this.config;
        let intermediateRecord: ServiceRequestAttributes;
        let recordCreated = true;
        let cleanedData: ParsedServiceRequestAttributes;
        let publicId: PublicId;

        if (this.inboundIsEmail(inboundData)) {
            const { subject, to, cc, bcc, from, text, headers } = inboundData;
            [cleanedData, publicId] = await extractServiceRequestfromInboundEmail(
                { subject, to, cc, bcc, from, text, headers }, inboundEmailDomain, inboundMapRepository
            );
        } else if (this.inboundIsSms(inboundData)) {
            const { To, From, Body } = inboundData;
            [cleanedData, publicId] = await extractServiceRequestfromInboundSms(
                { To, From, Body }, inboundMapRepository
            );
        } else {
            throw Error("Received an invalid inbound data payload");
        }

        if (publicId || cleanedData.serviceRequestId) {
            const [staffUsers, _count] = await staffUserRepository.findAll(
                cleanedData.jurisdictionId, { whereParams: { isAdmin: true } }
            );
            const staffEmails = staffUsers.map((user: StaffUserAttributes) => { return user.email }) as string[];
            let addedBy = '__SUBMITTER__';
            if (staffEmails.includes(cleanedData.email)) {
                const staffUserMatch = _.find(
                    staffUsers, (u) => { return u.email === cleanedData.email }
                ) as StaffUserAttributes;
                addedBy = staffUserMatch.id;
            }
            if (cleanedData.serviceRequestId) {
                intermediateRecord = await serviceRequestRepository.findOne(
                    cleanedData.jurisdictionId, cleanedData.serviceRequestId
                );
            } else {
                intermediateRecord = await serviceRequestRepository.findOneByPublicId(
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
                await serviceRequestRepository.createComment(
                    cleanedData.jurisdictionId, intermediateRecord.id, comment
                );
            } else {
                const dataToLog = { message: 'Invalid Comment Submitter.' }
                logger.error(dataToLog);
                throw new Error(dataToLog.message);
            }
        } else {
            intermediateRecord = await serviceRequestRepository.create(
                cleanedData
            ) as ServiceRequestInstance;
        }
        // requery to ensure we have all relations
        const record = await serviceRequestRepository.findOne(
            cleanedData.jurisdictionId, intermediateRecord.id
        );
        return [record, recordCreated];
    }

    async createMap(data: InboundMapAttributes): Promise<InboundMapAttributes> {
        const { inboundMapRepository } = this.repositories;
        const record = await inboundMapRepository.create(data) as InboundMapAttributes;
        return record;
    }

}
