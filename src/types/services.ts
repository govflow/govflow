import type Emittery from 'emittery';
import {
  AppConfig,
  CommunicationAttributes,
  JurisdictionAttributes,
  PluginBase,
  Repositories,
  ServiceRequestAttributes,
  ServiceRequestCreateAttributes
} from '.';
import { AuditedStateChangeExtraData, HookDataExtraData, InboundEmailDataAttributes, InboundMapAttributes, InboundSmsDataAttributes, PublicId, ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes, StaffUserAttributes, StaffUserDepartmentAttributes } from "./data";

export interface MinimalServiceBase extends PluginBase {
    repositories: Repositories;
    config: AppConfig;
}

export interface ServiceBase extends MinimalServiceBase {
    repositories: Repositories;
    config: AppConfig;
    hookRunner: IServiceRequestHookRunner;
}

export interface IOutboundMessageService extends MinimalServiceBase {
    dispatchServiceRequestCreate: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes[] | null>;
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
    ) => Promise<CommunicationAttributes[] | null>;
    dispatchServiceRequestComment: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes,
        extraData: HookDataExtraData
    ) => Promise<CommunicationAttributes[] | null>;
    dispatchCXSurvey: (
        jurisdiction: JurisdictionAttributes,
        serviceRequest: ServiceRequestAttributes
    ) => Promise<CommunicationAttributes | null>;
}

export interface IInboundMessageService extends ServiceBase {
    createMap: (data: InboundMapAttributes) => Promise<InboundMapAttributes>;
}

export interface IServiceRequestService extends ServiceBase {
    NEW_REQUEST_IDENTIFIER: string;
    create: (data: ServiceRequestCreateAttributes) => Promise<ServiceRequestAttributes>;
    update: (
      jurisdictionId: string,
      id: string,
      data: Partial<ServiceRequestAttributes>,
      existingData?: ServiceRequestAttributes
    ) => Promise<ServiceRequestAttributes>;
    createComment: (
        jurisdictionId: string, serviceRequestId: string, data: ServiceRequestCommentCreateAttributes
    ) => Promise<[ServiceRequestAttributes, ServiceRequestCommentAttributes]>;
    createAuditedStateChange: (
        jurisdictionId: string, id: string, key: string, value: string, extraData?: AuditedStateChangeExtraData
    ) => Promise<ServiceRequestAttributes | null>;
    disambiguateInboundData: (
        inboundData: InboundEmailDataAttributes | InboundSmsDataAttributes
    ) => Promise<[boolean, string, string, PublicId?]>;
    createServiceRequest: (
        inboundData: InboundEmailDataAttributes | InboundSmsDataAttributes,
        disambiguatedOriginalMessage?: string,
        knownIdentifier?: string
    ) =>
        Promise<[ServiceRequestAttributes, ServiceRequestCommentAttributes | undefined]>;
}

export interface IStaffUserService extends ServiceBase {
    getDepartmentMap: (jurisdictionId: string) => Promise<StaffUserDepartmentAttributes[] | null>;
    assignDepartment: (
        jurisdictionId: string, staffUserId: string, departmentId: string, isLead: boolean
    ) => Promise<StaffUserAttributes | null>;
    removeDepartment: (
        jurisdictionId: string, staffUserId: string, departmentId: string
    ) => Promise<StaffUserAttributes | null>;
}

export interface IServiceRequestHookRunner {
    dispatchHandler: IOutboundMessageService
    emitter: Emittery
    run: (
        hookName: string,
        jurisdiction: JurisdictionAttributes,
        record: ServiceRequestAttributes,
        extraData?: HookDataExtraData
    ) => Promise<void>;
}

export interface Services {
    inboundMessageService: IInboundMessageService;
    serviceRequestService: IServiceRequestService;
    staffUserService: IStaffUserService;
}
