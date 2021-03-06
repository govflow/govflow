import {
    AppConfig,
    CommunicationAttributes,
    JurisdictionAttributes,
    PluginBase,
    Repositories,
    ServiceRequestAttributes,
    ServiceRequestCreateAttributes
} from '.';
import { AuditedStateChangeExtraData, InboundEmailDataAttributes, InboundMapAttributes, InboundSmsDataAttributes, PublicId, ServiceRequestCommentAttributes, ServiceRequestStateChangeErrorResponse, StaffUserAttributes, StaffUserDepartmentAttributes, StaffUserStateChangeErrorResponse } from "./data";

export interface ServiceBase extends PluginBase {
    repositories: Repositories;
    config: AppConfig;
}

export interface IOutboundMessageService extends ServiceBase {
    dispatchServiceRequestCreate: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes[]>;
    dispatchServiceRequestChangeStatus: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes | null>;
    dispatchServiceRequestChangeAssignee: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes | null>;
    dispatchServiceRequestClosed: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes[]>;
    dispatchServiceRequestComment: (
        jurisdiction: JurisdictionAttributes,
        serviceRequestComment: ServiceRequestCommentAttributes
    ) => Promise<CommunicationAttributes[]>;
}

export interface IInboundMessageService extends ServiceBase {
    NEW_REQUEST_IDENTIFIER: string;
    disambiguateInboundData: (
        inboundData: InboundEmailDataAttributes | InboundSmsDataAttributes
    ) => Promise<[boolean, string, string, PublicId?]>;
    createServiceRequest: (
        inboundData: InboundEmailDataAttributes | InboundSmsDataAttributes,
        disambiguatedOriginalMessage?: string,
        knownIdentifier?: string
    ) =>
        Promise<[ServiceRequestAttributes, ServiceRequestCommentAttributes | undefined]>;
    createMap: (data: InboundMapAttributes) => Promise<InboundMapAttributes>;
}

export interface IServiceRequestService extends ServiceBase {
    create: (data: ServiceRequestCreateAttributes) => Promise<ServiceRequestAttributes>;
    createAuditedStateChange: (
        jurisdictionId: string, id: string, key: string, value: string, extraData?: AuditedStateChangeExtraData
    ) => Promise<ServiceRequestAttributes | ServiceRequestStateChangeErrorResponse>;
}

export interface IStaffUserService extends ServiceBase {
    getDepartmentMap: (jurisdictionId: string) => Promise<StaffUserDepartmentAttributes[] | null>;
    assignDepartment: (
        jurisdictionId: string, staffUserId: string, departmentId: string, isLead: boolean
    ) => Promise<StaffUserAttributes | null>;
    removeDepartment: (
        jurisdictionId: string, staffUserId: string, departmentId: string
    ) => Promise<StaffUserAttributes | StaffUserStateChangeErrorResponse | null>;
}

export interface Services {
    outboundMessageService: IOutboundMessageService;
    inboundMessageService: IInboundMessageService;
    serviceRequestService: IServiceRequestService;
    staffUserService: IStaffUserService;
}
