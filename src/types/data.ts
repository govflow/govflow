import type { Model } from 'sequelize';
import { IOutboundMessageService } from './services';


export type CXDataSource = 'OrganicDataItem' | 'CivicPlusSeeClickFix' | 'CivicPlusRequestTracker' | 'Lucity' | 'PublicStuff';

export type GovFlowUsageContext = '311' | '911' | 'Policing';

export type CommunicationChannels = 'email' | 'sms';

export type CommunicationTemplateTypes = 'subject' | 'body';

export type CommunicationTemplateNames = 'cx-survey-public-user' | 'service-request-changed-assignee-staff-user' | 'service-request-changed-status-staff-user' | 'service-request-closed-public-user' | 'service-request-closed-staff-user' | 'service-request-comment-broadcast-public-user' | 'service-request-comment-broadcast-staff-user' | 'service-request-new-public-user' | 'service-request-new-staff-user';

export interface JurisdictionAttributes {
  id: string;
  name: string;
  email: string;
  usageContext: GovFlowUsageContext;
  preferredBroadcastChannel: JurisdictionPreferredBroadcastChannel;
  enforceAssignmentThroughDepartment: boolean;
  filterBroadcastsByDepartment: boolean;
  broadcastToSubmitterOnRequestClosed: boolean;
  sendFromPhone?: string;
  sendFromEmail?: string;
  sendFromEmailVerified: boolean,
  replyToEmail?: string;
  replyToServiceRequestEnabled: boolean;
  workflowEnabled: boolean;
  workflowBroadcastWindow: number;
  cxSurveyEnabled: boolean;
  cxSurveyTriggerStatus: string;
  cxSurveyUrl: string;
  cxSurveyBroadcastWindow: number;
  cxDataSource: CXDataSource;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export type JurisdictionCreateAttributes = Partial<JurisdictionAttributes>

export interface JurisdictionInstance
  extends Model<JurisdictionAttributes, JurisdictionCreateAttributes>, JurisdictionAttributes { }

export interface StaffUserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  jurisdictionId: string;
  email: string;
  isAdmin: boolean;
  permissions: string[];
  departments: StaffUserDepartmentInlineAttributes[];
}

export type StaffUserCreateAttributes = Partial<StaffUserAttributes>

export interface StaffUserInstance
  extends Model<StaffUserAttributes, StaffUserCreateAttributes>, StaffUserAttributes { }

export interface StaffUserDepartmentAttributes {
  staffUserId: string;
  departmentId: string;
  isLead: boolean;
}

export interface StaffUserDepartmentInlineAttributes {
  departmentId: string;
  isLead: boolean;
}

export type StaffUserDepartmentCreateAttributes = Partial<StaffUserDepartmentAttributes>

export interface StaffUserDepartmentInstance
  extends Model<StaffUserDepartmentAttributes, StaffUserDepartmentCreateAttributes>, StaffUserDepartmentAttributes { }

export interface StaffUserLookUpAttributes {
  id: string;
  displayName: string;
  jurisdictionId: string;
  email: string;
}

export interface ServiceAttributes {
  id: string;
  name: string;
  group: string;
  jurisdictionId: string;
  defaultDepartmentId?: string;
}

export type ServiceCreateAttributes = Partial<ServiceAttributes>

export interface ServiceInstance
  extends Model<ServiceAttributes, ServiceCreateAttributes>, ServiceAttributes { }

export type ServiceRequestStatus = 'inbox' | 'todo' | 'doing' | 'blocked' | 'done' | 'invalid' | 'moved' | 'junk';

export type ServiceRequestInputChannel = 'webform' | 'bot' | 'sms' | 'email' | 'import';

export type ServiceRequestChannel = 'sms' | 'email' | 'anon' | 'multiple' | ''; // empty string because the model has a default value, and can calculate one

export type JurisdictionPreferredBroadcastChannel = 'email' | 'sms';

export interface ServiceRequestAttributes {
  id: string;
  publicId: string;
  idCounter: number;
  serviceId?: string;
  jurisdictionId: string;
  description: string;
  address: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ServiceRequestStatus;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  lat: number;
  lon: number;
  inputChannel: ServiceRequestInputChannel;
  channel: ServiceRequestChannel;
  closeDate: Date;
  displayName: string;
  departmentId: string;
  comments: ServiceRequestCommentAttributes[];
  inboundMaps: InboundMapAttributes[];
}

export interface ServiceRequestAnonAttributes {
  id: string;
  publicId: string;
  serviceId: string | null;
  serviceName: string | null;
  jurisdictionId: string;
  jurisdictionName: string;
  status: ServiceRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  closeDate: Date;
  departmentId: string | null;
  departmentName: string | null;
  context: string;
}

export type ServiceRequestCreateAttributes = Partial<ServiceRequestAttributes>

export interface ParsedServiceRequestAttributes {
  jurisdictionId: string;
  inputChannel: ServiceRequestInputChannel;
  channel: ServiceRequestChannel;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  description: string;
  createdAt: Date | undefined;
  departmentId?: string;
  assignedTo?: string;
  serviceRequestId?: string;
  serviceId?: string;
}

export interface ServiceRequestInstance
  extends Model<ServiceRequestAttributes, ServiceRequestCreateAttributes>, ServiceRequestAttributes { }

export interface ServiceRequestCommentAttributes {
  id: string;
  serviceRequestId: string;
  comment?: string;
  addedBy?: string;
  images?: string[];
  isBroadcast: boolean;
  broadcastToSubmitter: boolean;
  broadcastToAssignee: boolean;
  broadcastToStaff: boolean;
}

export type ServiceRequestCommentCreateAttributes = Partial<ServiceRequestCommentAttributes>

export interface ServiceRequestCommentInstance
  extends Model<ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes>,
  ServiceRequestCommentAttributes { }

export interface ServiceRequestStatusAttributes {
  id: string;
  label: string;
  isClosed: boolean;
}

export interface CommunicationAttributes {
  id?: string;
  channel: string;
  address: string;
  type: string;
  dispatched: boolean;
  dispatchPayload: DispatchConfigAttributes;
  dispatchResponse: Record<string, string>;
  accepted: boolean;
  delivered: boolean;
  serviceRequestId: string;
}

export type CommunicationCreateAttributes = Partial<CommunicationAttributes>

export interface CommunicationInstance
  extends Model<CommunicationAttributes, CommunicationCreateAttributes>, CommunicationAttributes { }

export interface DepartmentAttributes {
  id: string;
  name: string;
  primaryContactName: string;
  primaryContactEmail: string;
  jurisdictionId: string;
}

export type DepartmentCreateAttributes = Partial<DepartmentAttributes>

export interface DepartmentInstance
  extends Model<DepartmentAttributes, DepartmentCreateAttributes>, DepartmentAttributes { }

export interface InboundMapAttributes {
  id: string;
  channel: string;
  jurisdictionId: string;
  departmentId?: string;
  staffUserId?: string;
  serviceRequestId?: string;
  serviceId?: string;
}

export type InboundMapCreateAttributes = Partial<InboundMapAttributes>

export interface InboundMapInstance
  extends Model<InboundMapAttributes, InboundMapCreateAttributes>, InboundMapAttributes { }

export interface MessageDisambiguationAttributes {
  id: string;
  jurisdictionId: string;
  submitterId: string;
  status: string;
  result: string;
  originalMessage: string;
  disambiguationFlow: string[];
  choiceMap: Record<number, string>;
}

export type MessageDisambiguationCreateAttributes = Partial<MessageDisambiguationAttributes>

export interface MessageDisambiguationInstance
  extends Model<MessageDisambiguationAttributes, MessageDisambiguationCreateAttributes>,
  MessageDisambiguationAttributes { }

export type TemplateTypes = 'body' | 'subject';

export type TemplateNames = 'cx-survey-public-user' | 'service-request-changed-assignee-staff-user' | 'service-request-changed-status-staff-user' | 'service-request-closed-public-user' | 'service-request-closed-staff-user' | 'service-request-comment-broadcast-public-user' | 'service-request-comment-broadcast-staff-user' | 'service-request-new-public-user' | 'service-request-new-staff-user';

export interface TemplateAttributes {
  id: string;
  jurisdictionId: string;
  channel: CommunicationChannels;
  name: TemplateNames;
  type: TemplateTypes;
  content: string;
}

export type TemplateCreateAttributes = Partial<TemplateAttributes>

export interface TemplateInstance
  extends Model<TemplateAttributes, TemplateCreateAttributes>,
  TemplateAttributes { }

export interface SmsAttributes {
  to: string;
  from: string;
  body: string;
  statusCallback: string;
  messagingServiceSid: string;
  sendAt?: Date;
  scheduleType: 'fixed' | undefined;
}

export interface EmailAttributes {
  to: string;
  from: string;
  subject: string;
  send_at?: number;
  html: string;
  text: string;
}

export interface DispatchConfigAttributes {
  channel: string;
  type: string;
  sendGridApiKey: string;
  toEmail: string;
  fromEmail: string;
  replyToEmail: string;
  twilioAccountSid: string;
  twilioMessagingServiceSid: string;
  twilioAuthToken: string;
  twilioStatusCallbackURL: string;
  fromPhone: string;
  toPhone: string;
  sendAt: Date | undefined;
  serviceRequestId?: string;
}

export interface DispatchPayloadAttributes extends DispatchConfigAttributes {
  subject?: string;
  textBody: string;
  htmlBody?: string;
}

export type GovFlowMessageType = 'workflow' | 'cx';

export interface TemplateConfigContextAttributes {
  appName: string;
  appRequestUrl: string;
  serviceRequestStatus: string;
  serviceRequestPublicId: string;
  jurisdictionId: string;
  jurisdictionName: string;
  jurisdictionEmail: string;
  jurisdictionReplyToServiceRequestEnabled: boolean;
  recipientName: string;
  messageType: GovFlowMessageType;
}

export interface TemplateConfigAttributes {
  name: CommunicationTemplateNames;
  context: TemplateConfigContextAttributes;
}

export interface TestDataPayload {
  jurisdictions: JurisdictionAttributes[],
  staffUsers: StaffUserAttributes[],
  staffUserDepartments: StaffUserDepartmentAttributes[],
  services: ServiceAttributes[],
  serviceRequests: ServiceRequestAttributes[],
  communications: CommunicationAttributes[],
  departments: DepartmentAttributes[],
  inboundMaps: InboundMapAttributes[],
  channelStatuses: ChannelStatusAttributes[];
  templates: TemplateAttributes[];
}

export interface TestDataMakerOptions {
  jurisdiction: JurisdictionAttributes;
  serviceRequest: ServiceRequestAttributes;
  jurisdictions: JurisdictionAttributes[];
  staffUsers: StaffUserAttributes[];
  services: ServiceAttributes[];
  serviceRequests: ServiceRequestAttributes[];
  departments: DepartmentAttributes[];
  inboundMaps: InboundMapAttributes[];
  opts: Record<string, string>;
}

export interface InboundSmsDataAttributes {
  ToCountry: string;
  ToState: string;
  SmsMessageSid: string;
  NumMedia: string;
  ToCity: string;
  FromZip: string;
  SmsSid: string;
  FromState: string;
  SmsStatus: string;
  FromCity: string;
  Body: string;
  FromCountry: string;
  To: string;
  MessagingServiceSid: string;
  ToZip: string;
  NumSegments: string;
  ReferralNumMedia: string;
  MessageSid: string;
  AccountSid: string;
  From: string;
  ApiVersion: string;
}

export interface InboundSmsDataToRequestAttributes {
  To: string;
  From: string;
  Body: string;
}

export interface InboundEmailDataAttributes {
  headers: string;
  attachments: string;
  dkim: string;
  subject: string;
  to: string;
  cc?: string;
  bcc?: string;
  spam_score: string;
  from: string;
  text: string;
  sender_ip: string;
  spam_report: string;
  envelope: string;
  charsets: string;
  SPF: string;
}

export interface InboundEmailDataToRequestAttributes {
  headers: string;
  to: string;
  cc?: string;
  bcc?: string;
  from: string;
  subject: string;
  text: string;
}

export type PublicId = string | undefined;

export type ChannelType = "email" | "sms";

export interface EmailEventAttributes {
  email: string;
  event: string;
  timestamp: number;
  'smtp-id': string;
  category: string | [];
  sg_event_id?: string;
  sg_message_id?: string;
  type?: string;
}

export interface SmsEventAttributes {
  SmsSid: string;
  SmsStatus: string;
  MessageStatus: string;
  MessageSid: string;
  From: string;
  AccountSid: string;
}

export interface RecipientAttributes {
  email: string;
  displayName: string;
  isStaff: boolean;
}

export type LogEntry = [string, boolean | null | undefined];

export interface ChannelStatusAttributes {
  id: string;
  channel: string;
  isAllowed: boolean | null;
  log: LogEntry[];
}

export type ChannelStatusCreateAttributes = Partial<ChannelStatusAttributes>

export interface ChannelStatusInstance
  extends Model<ChannelStatusAttributes, ChannelStatusCreateAttributes>, ChannelStatusAttributes { }

export interface ChannelIsAllowed {
  id: string;
  isAllowed: boolean;
}

export interface AuditedStateChangeExtraData {
  user?: StaffUserAttributes;
  departmentId?: string;
}

export interface auditMessageFields {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface ParsedForwardEmailAddress {
  address: string;
  name: string;
}

export interface ParsedForwardEmail {
  from: ParsedForwardEmailAddress;
  to: ParsedForwardEmailAddress;
  subject: string;
  body: string;
}

export interface ParsedForwardedData {
  forwarded: boolean;
  message: string;
  email: ParsedForwardEmail;
}

export type HookDataExtraData = Record<string, string>;

export interface HookData {
  jurisdiction: JurisdictionAttributes;
  record: ServiceRequestAttributes;
  dispatchHandler: IOutboundMessageService;
  extraData?: HookDataExtraData;
}

export interface ScheduleWindow {
  min: number;
  max: number;
}
