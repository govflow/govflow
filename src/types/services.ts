import { AppSettings, CommunicationAttributes, JurisdictionAttributes, PluginBase, Repositories, ServiceRequestAttributes } from ".";
import { InboundEmailDataAttributes, InboundMapAttributes, ServiceRequestCommentAttributes } from "./data";

export interface ServiceBase extends PluginBase {
    repositories: Repositories;
    settings: AppSettings;
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

export interface Services {
    OutboundMessage: IOutboundMessageService;
    InboundMessage: IInboundMessageService;
}