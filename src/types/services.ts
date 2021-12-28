import { AppSettings, CommunicationAttributes, JurisdictionAttributes, PluginBase, Repositories, ServiceRequestAttributes } from ".";

export interface ServiceBase extends PluginBase {
    repositories: Repositories
    settings: AppSettings
}

export interface ICommunicationService extends ServiceBase {
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

export interface Services {
    Communication: ICommunicationService,
}