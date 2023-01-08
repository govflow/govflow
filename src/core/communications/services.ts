import { inject, injectable } from 'inversify';
import _ from 'lodash';
import logger from '../../logging';
import { appIds } from '../../registry/service-identifiers';
import type {
  AppConfig,
  CommunicationAttributes,
  DispatchConfigAttributes,
  HookDataExtraData,
  IInboundMessageService, InboundMapAttributes, IOutboundMessageService,
  IServiceRequestHookRunner,
  JurisdictionAttributes, RecipientAttributes,
  Repositories,
  ServiceRequestAttributes, ServiceRequestCommentAttributes, StaffUserAttributes, TemplateConfigContextAttributes
} from '../../types';
import { SERVICE_REQUEST_CLOSED_STATES } from '../service-requests';
import { dispatchMessage, getReplyToEmail, getSendFromEmail, getSendFromPhone, makeCXSurveyURL, makeRequestURL, makeSendAtDate, setDispatchChannel } from './helpers';

export class OutboundMessageService implements IOutboundMessageService {

  repositories: Repositories
  config: AppConfig

  constructor(
    repositories: Repositories,
    config: AppConfig
  ) {
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
  ): Promise<CommunicationAttributes[] | null> {
    const {
      sendGridApiKey,
      sendGridFromEmail,
      appName,
      appClientUrl,
      appClientRequestsPath,
      twilioAccountSid,
      twilioMessagingServiceSid,
      twilioAuthToken,
      twilioFromPhone,
      twilioStatusCallbackURL,
      inboundEmailDomain
    } = this.config;
    const { workflowEnabled, workflowBroadcastWindow, name, id } = jurisdiction;
    if (!workflowEnabled) {
      logger.info({
        message: `Inside, and exiting, dispatchServiceRequestCreate with workflow disabled for ${name}`,
        data: {
          jurisdiction: {
            id,
            name,
            workflowEnabled,
            workflowBroadcastWindow,
          },
          serviceRequest: {
            id: serviceRequest.id,
            status: serviceRequest.status,
          }
        }
      });
      return null;
    }
    const { communicationRepository, emailStatusRepository } = this.repositories;
    const records: CommunicationAttributes[] = [];
    const replyToEmail = getReplyToEmail(serviceRequest, jurisdiction, inboundEmailDomain, sendGridFromEmail);
    const sendFromEmail = getSendFromEmail(jurisdiction, sendGridFromEmail);
    const sendFromPhone = getSendFromPhone(jurisdiction, twilioFromPhone);
    const referenceDate = new Date();
    const sendAt = makeSendAtDate(referenceDate, workflowBroadcastWindow);

    const dispatchConfig = {
      channel: setDispatchChannel(serviceRequest.channel, jurisdiction.preferredBroadcastChannel),
      type: 'workflow',
      sendGridApiKey: sendGridApiKey as string,
      toEmail: serviceRequest.email as string,
      fromEmail: sendFromEmail as string,
      replyToEmail: replyToEmail as string,
      twilioAccountSid: twilioAccountSid as string,
      twilioMessagingServiceSid: twilioMessagingServiceSid as string,
      twilioAuthToken: twilioAuthToken as string,
      twilioStatusCallbackURL: twilioStatusCallbackURL as string,
      fromPhone: sendFromPhone as string,
      toPhone: serviceRequest.phone as string,
      sendAt: sendAt,
      serviceRequestId: serviceRequest.id,
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
        recipientName: serviceRequest.displayName as string,
        messageType: 'workflow'
      } as TemplateConfigContextAttributes
    }
    const record = await dispatchMessage(
      dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
    );
    if (record) { records.push(record); }

    const staffRecipients = await this.getStaffRecipients(jurisdiction, serviceRequest.departmentId);
    for (const staff of staffRecipients) {
      const dispatchConfig = {
        // TODO: review this at some point
        // channel: setDispatchChannel(serviceRequest.channel, jurisdiction.preferredBroadcastChannel)
        channel: 'email', // we only use email for staff
        type: 'workflow',
        sendGridApiKey: sendGridApiKey as string,
        toEmail: staff.email as string,
        fromEmail: sendGridFromEmail as string,
        replyToEmail: replyToEmail as string,
        twilioAccountSid: twilioAccountSid as string,
        twilioMessagingServiceSid: twilioMessagingServiceSid as string,
        twilioAuthToken: twilioAuthToken as string,
        twilioStatusCallbackURL: twilioStatusCallbackURL as string,
        fromPhone: sendFromPhone as string,
        toPhone: serviceRequest.phone as string,
        sendAt: sendAt,
        serviceRequestId: serviceRequest.id,
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
          recipientName: staff.displayName as string,
          messageType: 'workflow'
        } as TemplateConfigContextAttributes
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
    const { workflowEnabled, workflowBroadcastWindow, name, id } = jurisdiction;
    if (!workflowEnabled) {
      logger.info({
        message: `Inside, and exiting, dispatchServiceRequestChangeStatus with workflow disabled for ${name}`,
        data: {
          jurisdiction: {
            id,
            name,
            workflowEnabled,
            workflowBroadcastWindow,
          },
          serviceRequest: {
            id: serviceRequest.id,
            status: serviceRequest.status,
          }
        }
      });
      return null;
    }
    const {
      sendGridApiKey,
      sendGridFromEmail,
      appName,
      appClientUrl,
      appClientRequestsPath,
      twilioAccountSid,
      twilioMessagingServiceSid,
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
    const referenceDate = new Date();
    const sendAt = makeSendAtDate(referenceDate, workflowBroadcastWindow);
    const dispatchConfig = {
      // TODO: review this at some point
      // channel: setDispatchChannel(serviceRequest.channel, jurisdiction.preferredBroadcastChannel)
      channel: 'email', // we only use email for staff
      type: 'workflow',
      sendGridApiKey: sendGridApiKey as string,
      toEmail: staffUser.email as string,
      fromEmail: sendFromEmail as string,
      replyToEmail: replyToEmail as string,
      twilioAccountSid: twilioAccountSid as string,
      twilioMessagingServiceSid: twilioMessagingServiceSid as string,
      twilioAuthToken: twilioAuthToken as string,
      twilioStatusCallbackURL: twilioStatusCallbackURL as string,
      fromPhone: sendFromPhone as string,
      toPhone: serviceRequest.phone as string,
      sendAt,
      serviceRequestId: serviceRequest.id,
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
        recipientName: staffUser.displayName as string,
        messageType: 'workflow'
      } as TemplateConfigContextAttributes
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
    const { workflowEnabled, workflowBroadcastWindow, name, id } = jurisdiction;
    if (!workflowEnabled) {
      logger.info({
        message: `Inside, and exiting, dispatchServiceRequestChangeAssignee with workflow disabled for ${name}`,
        data: {
          jurisdiction: {
            id,
            name,
            workflowEnabled,
            workflowBroadcastWindow,
          },
          serviceRequest: {
            id: serviceRequest.id,
            status: serviceRequest.status,
          }
        }
      });
      return null;
    }
    const {
      sendGridApiKey,
      sendGridFromEmail,
      appName,
      appClientUrl,
      appClientRequestsPath,
      twilioAccountSid,
      twilioMessagingServiceSid,
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
    const referenceDate = new Date();
    const sendAt = makeSendAtDate(referenceDate, workflowBroadcastWindow);
    const dispatchConfig = {
      // TODO: review this at some point
      // channel: setDispatchChannel(serviceRequest.channel, jurisdiction.preferredBroadcastChannel)
      channel: 'email', // we only use email for staff
      type: 'workflow',
      sendGridApiKey: sendGridApiKey as string,
      toEmail: staffUser.email as string,
      fromEmail: sendFromEmail as string,
      replyToEmail: replyToEmail as string,
      twilioAccountSid: twilioAccountSid as string,
      twilioMessagingServiceSid: twilioMessagingServiceSid as string,
      twilioAuthToken: twilioAuthToken as string,
      twilioStatusCallbackURL: twilioStatusCallbackURL as string,
      fromPhone: sendFromPhone as string,
      toPhone: serviceRequest.phone as string,
      sendAt,
      serviceRequestId: serviceRequest.id,
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
        recipientName: staffUser.displayName as string,
        messageType: 'workflow'
      } as TemplateConfigContextAttributes
    }
    const record = await dispatchMessage(
      dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
    );
    return record;
  }

  async dispatchServiceRequestClosed(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes
  ): Promise<CommunicationAttributes[] | null> {
    const { workflowEnabled, workflowBroadcastWindow, name, id } = jurisdiction;
    if (!workflowEnabled) {
      logger.info({
        message: `Inside, and exiting, dispatchServiceRequestClosed with workflow disabled for ${name}`,
        data: {
          jurisdiction: {
            id,
            name,
            workflowEnabled,
            workflowBroadcastWindow,
          },
          serviceRequest: {
            id: serviceRequest.id,
            status: serviceRequest.status,
          }
        }
      });
      return null;
    }
    const {
      sendGridApiKey,
      sendGridFromEmail,
      appName,
      appClientUrl,
      appClientRequestsPath,
      twilioAccountSid,
      twilioMessagingServiceSid,
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
    const referenceDate = new Date();
    const sendAt = makeSendAtDate(referenceDate, workflowBroadcastWindow);

    if (jurisdiction.broadcastToSubmitterOnRequestClosed) {
      const dispatchConfig = {
        channel: setDispatchChannel(serviceRequest.channel, jurisdiction.preferredBroadcastChannel),
        type: 'workflow',
        sendGridApiKey: sendGridApiKey as string,
        toEmail: serviceRequest.email as string,
        fromEmail: sendFromEmail as string,
        replyToEmail: replyToEmail as string,
        twilioAccountSid: twilioAccountSid as string,
        twilioMessagingServiceSid: twilioMessagingServiceSid as string,
        twilioAuthToken: twilioAuthToken as string,
        twilioStatusCallbackURL: twilioStatusCallbackURL as string,
        fromPhone: sendFromPhone as string,
        toPhone: serviceRequest.phone as string,
        sendAt,
        serviceRequestId: serviceRequest.id,
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
          recipientName: serviceRequest.displayName as string,
          messageType: 'workflow'
        } as TemplateConfigContextAttributes
      }
      const record = await dispatchMessage(
        dispatchConfig, templateConfig, communicationRepository, emailStatusRepository
      );
      if (record) { records.push(record); }
    }

    const staffRecipients = await this.getStaffRecipients(jurisdiction, serviceRequest.departmentId);
    for (const staff of staffRecipients) {
      const dispatchConfig = {
        // TODO: review this at some point
        // channel: setDispatchChannel(serviceRequest.channel, jurisdiction.preferredBroadcastChannel)
        channel: 'email', // we only use email for staff
        type: 'workflow',
        sendGridApiKey: sendGridApiKey as string,
        toEmail: staff.email as string,
        fromEmail: sendGridFromEmail as string,
        replyToEmail: replyToEmail as string,
        twilioAccountSid: twilioAccountSid as string,
        twilioMessagingServiceSid: twilioMessagingServiceSid as string,
        twilioAuthToken: twilioAuthToken as string,
        twilioStatusCallbackURL: twilioStatusCallbackURL as string,
        fromPhone: sendFromPhone as string,
        toPhone: serviceRequest.phone as string,
        sendAt,
        serviceRequestId: serviceRequest.id,
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
          recipientName: staff.displayName as string,
          messageType: 'workflow'
        } as TemplateConfigContextAttributes
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
    serviceRequest: ServiceRequestAttributes,
    extraData: HookDataExtraData
  ): Promise<CommunicationAttributes[] | null> {
    const { workflowEnabled, workflowBroadcastWindow, name, id } = jurisdiction;
    if (!workflowEnabled) {
      logger.warn({
        message: `Inside, and exiting, dispatchServiceRequestComment with workflow disabled for ${name}`,
        data: {
          jurisdiction: {
            id,
            name,
            workflowEnabled,
            workflowBroadcastWindow,
          },
          serviceRequest: {
            id: serviceRequest.id,
            status: serviceRequest.status,
          }
        }
      });
      return null;
    }
    const {
      sendGridApiKey,
      sendGridFromEmail,
      appName,
      appClientUrl,
      appClientRequestsPath,
      twilioAccountSid,
      twilioMessagingServiceSid,
      twilioAuthToken,
      twilioFromPhone,
      twilioStatusCallbackURL,
      inboundEmailDomain
    } = this.config;
    const {
      communicationRepository,
      staffUserRepository,
      emailStatusRepository
    } = this.repositories;
    const { serviceRequestCommentId } = extraData;
    const serviceRequestComment = serviceRequest.comments.find(
      i => i.id === serviceRequestCommentId
    ) as ServiceRequestCommentAttributes;
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
      channel: setDispatchChannel(serviceRequest.channel, jurisdiction.preferredBroadcastChannel),
      type: 'workflow',
      sendGridApiKey: sendGridApiKey as string,
      toEmail: '', // populated per recipient
      fromEmail: sendFromEmail as string,
      replyToEmail: replyToEmail as string,
      twilioAccountSid: twilioAccountSid as string,
      twilioMessagingServiceSid: twilioMessagingServiceSid as string,
      twilioAuthToken: twilioAuthToken as string,
      twilioStatusCallbackURL: twilioStatusCallbackURL as string,
      fromPhone: sendFromPhone as string,
      toPhone: serviceRequest.phone as string,
      serviceRequestId: serviceRequest.id,
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
          recipientName: recipient.displayName as string,
          messageType: 'workflow'
        } as TemplateConfigContextAttributes
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
    const { id, name, cxSurveyEnabled, cxSurveyTriggerStatus, cxSurveyUrl, cxSurveyBroadcastWindow } = jurisdiction;
    if (!cxSurveyEnabled) {
      logger.info({
        message: `Inside, and exiting, dispatchCXSurvey with cx survey disabled for ${name}`,
        data: {
          jurisdiction: {
            id,
            name,
            cxSurveyEnabled,
            cxSurveyTriggerStatus,
            cxSurveyUrl,
            cxSurveyBroadcastWindow,
          },
          serviceRequest: {
            id: serviceRequest.id,
            status: serviceRequest.status,
          }
        }
      });
      return null;
    }
    logger.info({
      message: `Entering dispatch of CX survey for ${name}`,
      data: {
        jurisdiction: {
          id,
          name,
          cxSurveyEnabled,
          cxSurveyTriggerStatus,
          cxSurveyUrl,
          cxSurveyBroadcastWindow
        },
        serviceRequest: {
          id: serviceRequest.id,
          status: serviceRequest.status,
        }
      }
    })

    // exit early when we dont meet the essential conditions
    if (!cxSurveyUrl || serviceRequest.status !== cxSurveyTriggerStatus) {
      logger.warn({
        message: `Early exit dispatch of CX survey with insufficient conditions for ${jurisdiction.name}`,
        data: {
          jurisdiction: {
            id,
            name,
            cxSurveyEnabled,
            cxSurveyTriggerStatus,
            cxSurveyUrl,
            cxSurveyBroadcastWindow
          },
          serviceRequest: {
            id: serviceRequest.id,
            status: serviceRequest.status,
          },
        }
      })
      return null;
    }

    const {
      sendGridApiKey,
      sendGridFromEmail,
      appName,
      twilioAccountSid,
      twilioMessagingServiceSid,
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
    const referenceDate = SERVICE_REQUEST_CLOSED_STATES.includes(serviceRequest.status)
      ? serviceRequest.closeDate
      : serviceRequest.updatedAt;
    const sendAt = makeSendAtDate(referenceDate, cxSurveyBroadcastWindow);
    const dispatchConfig = {
      channel: setDispatchChannel(serviceRequest.channel, jurisdiction.preferredBroadcastChannel),
      type: 'cx',
      sendGridApiKey: sendGridApiKey as string,
      toEmail: serviceRequest.email as string,
      fromEmail: sendFromEmail as string,
      sendAt: sendAt,
      replyToEmail: replyToEmail as string,
      twilioAccountSid: twilioAccountSid as string,
      twilioMessagingServiceSid: twilioMessagingServiceSid as string,
      twilioAuthToken: twilioAuthToken as string,
      twilioStatusCallbackURL: twilioStatusCallbackURL as string,
      fromPhone: sendFromPhone as string,
      toPhone: serviceRequest.phone as string,
      serviceRequestId: serviceRequest.id,
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
        recipientName: serviceRequest.displayName as string,
        messageType: 'cx'
      } as TemplateConfigContextAttributes
    }

    logger.info({
      message: `Will dispatch a CX survey for ${jurisdiction.name}`,
      data: {
        jurisdiction: {
          id,
          name
        },
        serviceRequest: {
          id: serviceRequest.id,
          status: serviceRequest.status
        },
        dispatchConfig,
        templateConfig
      }
    })

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
  hookRunner: IServiceRequestHookRunner

  constructor(
    @inject(appIds.Repositories) repositories: Repositories,
    @inject(appIds.AppConfig) config: AppConfig,
    @inject(appIds.ServiceRequestHookRunner) hookRunner: IServiceRequestHookRunner,
  ) {
    this.repositories = repositories;
    this.config = config;
    this.hookRunner = hookRunner;
  }

  async createMap(data: InboundMapAttributes): Promise<InboundMapAttributes> {
    const { inboundMapRepository } = this.repositories;
    const record = await inboundMapRepository.create(data) as InboundMapAttributes;
    return record;
  }

}
