import type { Model } from 'sequelize';

export interface JurisdictionAttributes {
    id: string;
    name: string;
    email: string;
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
}

export type StaffUserCreateAttributes = Partial<StaffUserAttributes>

export interface StaffUserInstance
    extends Model<StaffUserAttributes, StaffUserCreateAttributes>, StaffUserAttributes { }

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
}

export type ServiceCreateAttributes = Partial<ServiceAttributes>

export interface ServiceInstance
    extends Model<ServiceAttributes, ServiceCreateAttributes>, ServiceAttributes { }

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
    status: string;
    assignedTo: string;
    createdAt: Date;
    updatedAt: Date;
    images: string[];
    lat: number;
    lon: number;
    inputChannel: string;
    communicationChannel: string;
    communicationValid: boolean;
    closeDate: Date;
    displayName: string;
    departmentId: string;
    comments: ServiceRequestCommentAttributes[];
}

export type ServiceRequestCreateAttributes = Partial<ServiceRequestAttributes>

export interface ParsedServiceRequestAttributes {
    jurisdictionId: string;
    inputChannel: string;
    firstName: string;
    lastName: string;
    email: string;
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
}

export type ServiceRequestCommentCreateAttributes = Partial<ServiceRequestCommentAttributes>

export interface ServiceRequestCommentInstance
    extends Model<ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes>,
    ServiceRequestCommentAttributes { }

export interface ServiceRequestStatusAttributes {
    id: string;
    label: string;
}

export interface CommunicationAttributes {
    id?: string;
    channel: string;
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
    jurisdictionId: string;
    departmentId?: string;
    staffUserId?: string;
    serviceRequestId?: string;
    serviceId?: string;
}

export type InboundMapCreateAttributes = Partial<InboundMapAttributes>

export interface InboundMapInstance
    extends Model<InboundMapAttributes, InboundMapCreateAttributes>, InboundMapAttributes { }

export interface SmsAttributes {
    to: string;
    from: string;
    body: string;
}

export interface EmailAttributes {
    to: string;
    form: string;
    subject: string;
    body: string;
}

export interface DispatchConfigAttributes {
    channel: string;
    sendGridApiKey: string;
    toEmail: string;
    fromEmail: string;
    replyToEmail: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    fromPhone: string;
    toPhone: string;
}

export interface DispatchPayloadAttributes extends DispatchConfigAttributes {
    subject?: string;
    textBody: string;
    htmlBody?: string;
}

export interface TemplateConfigContextAttributes {
    appName: string;
    appRequestUrl: string;
    serviceRequestStatus: string;
    serviceRequestPublicId: string;
    jurisdictionName: string;
    jurisdictionEmail: string;
    recipientName: string;
}

export interface TemplateConfigAttributes {
    name: string;
    context: TemplateConfigContextAttributes;
}

export interface TestDataPayload {
    jurisdictions: JurisdictionAttributes[];
    staffUsers: StaffUserAttributes[];
    services: ServiceAttributes[];
    serviceRequests: ServiceRequestAttributes[];
    communications: CommunicationAttributes[];
    departments: DepartmentAttributes[];
    inboundMaps: InboundMapAttributes[];
    channelStatuses: ChannelStatusAttributes[];
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
