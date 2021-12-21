import type {
    AppSettings,
    CommunicationAttributes,
    DepartmentAttributes,
    EventAttributes,
    JurisdictionAttributes,
    Models,
    QueryParamsAll,
    ServiceAttributes,
    ServiceRequestAttributes,
    ServiceRequestCommentAttributes,
    StaffUserAttributes,
    StaffUserLookUpAttributes
} from ".";
import { Open311Service, Open311ServiceRequest } from "../core/open311/types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginBase {
    //plugin?: boolean
}

export interface RepositoryBase extends PluginBase {
    models?: Models
    repositories?: Repositories
    settings?: AppSettings
}

export interface IJurisdictionRepository extends RepositoryBase {
    create: (data: JurisdictionAttributes) => Promise<JurisdictionAttributes>;
    findOne: (id: string) => Promise<JurisdictionAttributes>;
}

export interface IStaffUserRepository extends RepositoryBase {
    create: (data: StaffUserAttributes) => Promise<StaffUserAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<StaffUserAttributes>;
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
    create: (data: ServiceRequestAttributes) => Promise<ServiceRequestAttributes>;
    update: (
        jurisdictionId: string, id: string, data: Partial<ServiceRequestAttributes>
    ) => Promise<ServiceRequestAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<ServiceRequestAttributes>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[ServiceRequestAttributes[], number]>;
    findStatusList: (id: string) => Promise<Record<string, string>>;
    getStats: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<Record<string, Record<string, number>>>;
    createComment: (
        jurisdictionId: string,
        serviceRequestId: string,
        data: ServiceRequestCommentAttributes
    ) => Promise<ServiceRequestCommentAttributes>;
    updateComment: (
        jurisdictionId: string,
        serviceRequestId: string,
        serviceRequestCommentId: string,
        data: Partial<ServiceRequestCommentAttributes>) => Promise<ServiceRequestCommentAttributes>;
    updateStatus: (jurisdictionId: string, id: string, status: string) => Promise<ServiceRequestAttributes>;
    updateAssignedTo: (jurisdictionId: string, id: string, status: string) => Promise<ServiceRequestAttributes>;
}

export interface IOpen311ServiceRepository extends RepositoryBase {
    findOne: (jurisdictionId: string, code: string) => Promise<Open311Service>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<Open311Service[]>;
}

export interface IOpen311ServiceRequestRepository extends RepositoryBase {
    create: (data: Record<string, unknown>) => Promise<Open311ServiceRequest>;
    findOne: (jurisdictionId: string, id: string) => Promise<Open311ServiceRequest>;
    // findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}

export interface IEventRepository extends RepositoryBase {
    create: (data: EventAttributes) => Promise<EventAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<EventAttributes>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[EventAttributes[], number]>;
}

export interface ICommunicationRepository extends RepositoryBase {
    create: (data: CommunicationAttributes) => Promise<CommunicationAttributes>;
    findByServiceRequestId: (serviceRequestId: string) => Promise<[CommunicationAttributes[], number]>;
    dispatchServiceRequestCreate: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes[]>;
    dispatchServiceRequestChangeStatus: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes>;
    dispatchServiceRequestChangeAssignee: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes>;
    dispatchServiceRequestClosed: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes[]>;
}

export interface IDepartmentRepository extends RepositoryBase {
    create: (data: DepartmentAttributes) => Promise<DepartmentAttributes>;
    update: (jurisdictionId: string, id: string, data: Partial<DepartmentAttributes>) => Promise<DepartmentAttributes>;
    findOne: (jurisdictionId: string, id: string) => Promise<DepartmentAttributes>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[DepartmentAttributes[], number]>;
}

export interface Repositories {
    Jurisdiction: IJurisdictionRepository,
    StaffUser: IStaffUserRepository,
    Service: IServiceRepository,
    ServiceRequest: IServiceRequestRepository,
    Open311Service: IOpen311ServiceRepository,
    Open311ServiceRequest: IOpen311ServiceRequestRepository,
    Event: IEventRepository,
    Communication: ICommunicationRepository,
    Department: IDepartmentRepository,
}
