import { AppConfig, CommunicationAttributes, JurisdictionAttributes, PluginBase, Repositories, ServiceRequestAttributes } from ".";
import { AuditedStateChangeExtraData, InboundEmailDataAttributes, InboundMapAttributes, ServiceRequestCommentAttributes, ServiceRequestStateChangeErrorResponse, StaffUserAttributes, StaffUserDepartmentAttributes, StaffUserStateChangeErrorResponse } from "./data";

export interface ServiceBase extends PluginBase {
    repositories: Repositories;
    settings: AppConfig;
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
    createServiceRequest: (inboundEmailData: InboundEmailDataAttributes) =>
        Promise<[ServiceRequestAttributes, boolean]>;
    createMap: (data: InboundMapAttributes) => Promise<InboundMapAttributes>;
}

export interface IServiceRequestService extends ServiceBase {
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
