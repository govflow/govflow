import type {
    AppSettings,
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
import { ChannelIsAllowed, ChannelStatusAttributes, ChannelStatusInstance, EmailEventAttributes, InboundMapCreateAttributes, InboundMapInstance, ServiceRequestCommentCreateAttributes } from './data';

export interface RepositoryBase extends PluginBase {
    models: Models;
    settings: AppSettings;
}

export interface IJurisdictionRepository extends RepositoryBase {
    create: (data: Partial<JurisdictionAttributes>) => Promise<JurisdictionAttributes>;
    findOne: (id: string) => Promise<JurisdictionAttributes>;
    update: (id: string, data: Partial<JurisdictionAttributes>) => Promise<JurisdictionAttributes>;
}

export interface IStaffUserRepository extends RepositoryBase {
    create: (data: StaffUserAttributes) => Promise<StaffUserAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<StaffUserAttributes | null>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[StaffUserAttributes[], number]>;
    lookupTable: (jurisdictionId: string) => Promise<[StaffUserLookUpAttributes[], number]>;
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

export interface IInboundMapRepository extends RepositoryBase {
    create: (data: InboundMapCreateAttributes) =>
        Promise<InboundMapInstance>;
    findOne: (id: string) => Promise<InboundMapInstance | null>;
}

export interface Repositories {
    Jurisdiction: IJurisdictionRepository;
    StaffUser: IStaffUserRepository;
    Service: IServiceRepository;
    ServiceRequest: IServiceRequestRepository;
    Communication: ICommunicationRepository;
    Department: IDepartmentRepository;
    EmailStatus: IEmailStatusRepository;
    InboundMap: IInboundMapRepository;
}
