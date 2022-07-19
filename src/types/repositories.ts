import type {
    AppConfig,
    CommunicationAttributes,
    CommunicationCreateAttributes,
    DepartmentAttributes, JurisdictionAttributes,
    Models, PluginBase, QueryParamsAll,
    ServiceAttributes,
    ServiceRequestAttributes,
    ServiceRequestCommentAttributes, ServiceRequestStatusAttributes,
    StaffUserAttributes,
    StaffUserLookUpAttributes
} from '.';
import { ChannelIsAllowed, ChannelStatusAttributes, ChannelStatusInstance, ChannelType, EmailEventAttributes, InboundMapCreateAttributes, InboundMapInstance, MessageDisambiguationAttributes, MessageDisambiguationCreateAttributes, ServiceRequestCommentCreateAttributes, SmsEventAttributes, StaffUserDepartmentAttributes } from './data';

export interface RepositoryBase extends PluginBase {
    models: Models;
    config: AppConfig;
}

export interface IJurisdictionRepository extends RepositoryBase {
    create: (data: Partial<JurisdictionAttributes>) => Promise<JurisdictionAttributes>;
    findOne: (id: string) => Promise<JurisdictionAttributes>;
    update: (id: string, data: Partial<JurisdictionAttributes>) => Promise<JurisdictionAttributes>;
    hasStaffUser: (id: string, staffUserId: string) => Promise<boolean>;
}

export interface IStaffUserRepository extends RepositoryBase {
    create: (data: StaffUserAttributes) => Promise<StaffUserAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<StaffUserAttributes | null>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[StaffUserAttributes[], number]>;
    lookupTable: (jurisdictionId: string) => Promise<[StaffUserLookUpAttributes[], number]>;
    getDepartmentMap: (jurisdictionId: string) => Promise<StaffUserDepartmentAttributes[] | null>;
    assignDepartment: (
        jurisdictionId: string, staffUserId: string, departmentId: string, isLead: boolean
    ) => Promise<StaffUserAttributes | null>;
    removeDepartment: (
        jurisdictionId: string, staffUserId: string, departmentId: string
    ) => Promise<StaffUserAttributes | null>;
}

export interface IServiceRepository extends RepositoryBase {
    create: (data: ServiceAttributes) => Promise<ServiceAttributes>;
    update: (jurisdictionId: string, id: string, data: Partial<ServiceAttributes>) => Promise<ServiceAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<ServiceAttributes>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[ServiceAttributes[], number]>;
}

export interface IServiceRequestRepository extends RepositoryBase {
    create: (data: Partial<ServiceRequestAttributes>) => Promise<ServiceRequestAttributes>;
    update: (
        jurisdictionId: string, id: string, data: Partial<ServiceRequestAttributes>
    ) => Promise<ServiceRequestAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<ServiceRequestAttributes>;
    findOneByPublicId: (jurisdictionId: string, publicId: string) => Promise<ServiceRequestAttributes>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[ServiceRequestAttributes[], number]>;
    findAllForSubmitter: (
        jurisdictionId: string, channel: string, submitterId: string
    ) => Promise<[ServiceRequestAttributes[], number]>;
    findStatusList: (jurisdictionId: string) => Promise<ServiceRequestStatusAttributes[]>;
    getStats: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<Record<string, Record<string, number>>>;
    createComment: (
        jurisdictionId: string,
        serviceRequestId: string,
        data: ServiceRequestCommentCreateAttributes,
        user?: StaffUserAttributes
    ) => Promise<ServiceRequestCommentAttributes>;
    updateComment: (
        jurisdictionId: string,
        serviceRequestId: string,
        serviceRequestCommentId: string,
        data: Partial<ServiceRequestCommentAttributes>) => Promise<ServiceRequestCommentAttributes>;
}

export interface ICommunicationRepository extends RepositoryBase {
    create: (data: CommunicationCreateAttributes) => Promise<CommunicationAttributes>;
    findByServiceRequestId: (serviceRequestId: string) => Promise<[CommunicationAttributes[], number]>;
}

export interface IDepartmentRepository extends RepositoryBase {
    create: (data: DepartmentAttributes) => Promise<DepartmentAttributes>;
    update: (jurisdictionId: string, id: string, data: Partial<DepartmentAttributes>) => Promise<DepartmentAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<DepartmentAttributes>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[DepartmentAttributes[], number]>;
}

export interface IEmailStatusRepository extends RepositoryBase {
    create: (data: ChannelStatusAttributes) =>
        Promise<ChannelStatusInstance>;
    createFromEvent: (data: EmailEventAttributes) =>
        Promise<ChannelStatusInstance>;
    findOne: (email: string) => Promise<ChannelStatusInstance | null>;
    isAllowed: (email: string) => Promise<ChannelIsAllowed>;
}

export interface ISmsStatusRepository extends RepositoryBase {
    create: (data: ChannelStatusAttributes) =>
        Promise<ChannelStatusInstance>;
    createFromEvent: (data: SmsEventAttributes) =>
        Promise<ChannelStatusInstance>;
    findOne: (phone: string) => Promise<ChannelStatusInstance | null>;
    isAllowed: (phone: string) => Promise<ChannelIsAllowed>;
}

export interface IInboundMapRepository extends RepositoryBase {
    create: (data: InboundMapCreateAttributes) =>
        Promise<InboundMapInstance>;
    findOne: (id: string, channel: ChannelType) => Promise<InboundMapInstance | null>;
}

export interface IMessageDisambiguationRepository extends RepositoryBase {
    create: (data: MessageDisambiguationCreateAttributes) =>
        Promise<MessageDisambiguationAttributes>;
    findOne: (jurisdictionId: string, submitterId: string) => Promise<MessageDisambiguationAttributes | null>;
    update: (
        id: string, data: Partial<MessageDisambiguationAttributes>
    ) => Promise<MessageDisambiguationAttributes | null>;
}

export interface Repositories {
    jurisdictionRepository: IJurisdictionRepository;
    staffUserRepository: IStaffUserRepository;
    serviceRepository: IServiceRepository;
    serviceRequestRepository: IServiceRequestRepository;
    communicationRepository: ICommunicationRepository;
    departmentRepository: IDepartmentRepository;
    emailStatusRepository: IEmailStatusRepository;
    smsStatusRepository: ISmsStatusRepository;
    inboundMapRepository: IInboundMapRepository;
    messageDisambiguationRepository: IMessageDisambiguationRepository;
}
