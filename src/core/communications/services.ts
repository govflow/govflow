import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { appIds } from '../../registry/service-identifiers';
import type {
    AppConfig,
    CommunicationAttributes,
    DispatchConfigAttributes,
    IInboundMessageService, InboundMapAttributes, IOutboundMessageService,
    JurisdictionAttributes, RecipientAttributes,
    Repositories,
    ServiceRequestAttributes, ServiceRequestCommentAttributes, StaffUserAttributes
} from '../../types';
import { dispatchMessage, getReplyToEmail, getSendFromEmail, getSendFromPhone, makeCXSurveyURL, makeRequestURL } from './helpers';

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
            twilioStatusCallbackURL,
            inboundEmailDomain
        } = this.config;

        const { communicationRepository, emailStatusRepository } = this.repositories;
        const records: CommunicationAttributes[] = [];
        const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);

        const dispatchConfig = {
            channel: serviceRequest.channel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            twilioStatusCallbackURL: twilioStatusCallbackURL as string,
            fromPhone: sendFromPhone as string,
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
                channel: 'email', // we only use email for staff
                sendGridApiKey: sendGridApiKey as string,
                toEmail: staff.email as string,
                fromEmail: sendGridFromEmail as string,
                replyToEmail: replyToEmail as string,
                twilioAccountSid: twilioAccountSid as string,
                twilioAuthToken: twilioAuthToken as string,
                twilioStatusCallbackURL: twilioStatusCallbackURL as string,
                fromPhone: sendFromPhone as string,
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
            twilioStatusCallbackURL,
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
        const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);
        const dispatchConfig = {
            channel: 'email', // we only use email for staff
            sendGridApiKey: sendGridApiKey as string,
            toEmail: staffUser.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            twilioStatusCallbackURL: twilioStatusCallbackURL as string,
            fromPhone: sendFromPhone as string,
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
            twilioStatusCallbackURL,
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
        const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);
        const dispatchConfig = {
            channel: 'email', // we only use email for staff
            sendGridApiKey: sendGridApiKey as string,
            toEmail: staffUser.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            twilioStatusCallbackURL: twilioStatusCallbackURL as string,
            fromPhone: sendFromPhone as string,
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
            twilioStatusCallbackURL,
            inboundEmailDomain
        } = this.config;
        const { communicationRepository, emailStatusRepository } = this.repositories;
        const records: CommunicationAttributes[] = [];
        const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);

        if (jurisdiction.broadcastToSubmitterOnRequestClosed) {
            const dispatchConfig = {
                channel: serviceRequest.channel as string,
                sendGridApiKey: sendGridApiKey as string,
                toEmail: serviceRequest.email as string,
                fromEmail: sendFromEmail as string,
                replyToEmail: replyToEmail as string,
                twilioAccountSid: twilioAccountSid as string,
                twilioAuthToken: twilioAuthToken as string,
                twilioStatusCallbackURL: twilioStatusCallbackURL as string,
                fromPhone: sendFromPhone as string,
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
                channel: 'email', // we only use email for staff
                sendGridApiKey: sendGridApiKey as string,
                toEmail: staff.email as string,
                fromEmail: sendGridFromEmail as string,
                replyToEmail: replyToEmail as string,
                twilioAccountSid: twilioAccountSid as string,
                twilioAuthToken: twilioAuthToken as string,
                twilioStatusCallbackURL: twilioStatusCallbackURL as string,
                fromPhone: sendFromPhone as string,
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
            twilioStatusCallbackURL,
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
        const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);
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
            channel: serviceRequest.channel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: '', // populated per recipient
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            twilioStatusCallbackURL: twilioStatusCallbackURL as string,
            fromPhone: sendFromPhone as string,
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
            if (_userType === 'staff-user') {
                dispatchConfig.channel = 'email'; // we only use email for staff
            }
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

    async dispatchCXSurvey(
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes,
    ): Promise<CommunicationAttributes | null> {

        const { cxSurveyEnabled, cxSurveyTriggerStatus, cxSurveyUrl } = jurisdiction;
        // exit early when we dont meet the essential conditions
        if (!cxSurveyEnabled || !cxSurveyUrl || serviceRequest.status !== cxSurveyTriggerStatus) {
            return null;
        }

        const {
            sendGridApiKey,
            sendGridFromEmail,
            appName,
            twilioAccountSid,
            twilioAuthToken,
            twilioFromPhone,
            twilioStatusCallbackURL,
        } = this.config;
        const { communicationRepository, emailStatusRepository } = this.repositories;
        let record: CommunicationAttributes | null = null;
        const replyToEmail = sendGridFromEmail; // getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
        const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
        const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);
        const surveyUrl = makeCXSurveyURL(jurisdiction, serviceRequest);

        const dispatchConfig = {
            channel: serviceRequest.channel as string,
            sendGridApiKey: sendGridApiKey as string,
            toEmail: serviceRequest.email as string,
            fromEmail: sendFromEmail as string,
            replyToEmail: replyToEmail as string,
            twilioAccountSid: twilioAccountSid as string,
            twilioAuthToken: twilioAuthToken as string,
            twilioStatusCallbackURL: twilioStatusCallbackURL as string,
            fromPhone: sendFromPhone as string,
            toPhone: serviceRequest.phone as string
        }
        const templateConfig = {
            name: 'cx-survey-public-user',
            context: {
                appName,
                appRequestUrl: surveyUrl,
                serviceRequestStatus: serviceRequest.status,
                serviceRequestPublicId: serviceRequest.publicId,
                jurisdictionName: jurisdiction.name,
                jurisdictionEmail: jurisdiction.email,
                jurisdictionReplyToServiceRequestEnabled: jurisdiction.replyToServiceRequestEnabled,
                recipientName: serviceRequest.displayName as string
            }
        }
        record = await dispatchMessage(
            dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
        );
        return record;
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

    async createMap(data: InboundMapAttributes): Promise<InboundMapAttributes> {
        const { inboundMapRepository } = this.repositories;
        const record = await inboundMapRepository.create(data) as InboundMapAttributes;
        return record;
    }

}
