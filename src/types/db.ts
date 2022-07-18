import { Model, ModelAttributes, ModelCtor, ModelOptions, QueryInterface, Sequelize } from "sequelize/types";
import { Umzug } from "umzug";
import { CommunicationAttributes, CommunicationCreateAttributes, DepartmentAttributes, DepartmentCreateAttributes, JurisdictionAttributes, JurisdictionCreateAttributes, ServiceAttributes, ServiceCreateAttributes, ServiceRequestAttributes, ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes, ServiceRequestCreateAttributes, StaffUserAttributes, StaffUserCreateAttributes, StaffUserDepartmentAttributes, StaffUserDepartmentCreateAttributes } from ".";
import { ChannelStatusAttributes, ChannelStatusCreateAttributes, InboundMapAttributes, InboundMapCreateAttributes, MessageDisambiguationAttributes, MessageDisambiguationCreateAttributes } from "./data";

export type DatabaseEngine = Sequelize;
export type MigrationEngine = Umzug<QueryInterface>;

export interface ModelDefinition {
    name: string;
    attributes: ModelAttributes;
    options?: ModelOptions;
}

export interface QueryParamsOne {
    whereParams?: Record<string, unknown>;
    selectFields?: string[];

}

export interface QueryParamsAll extends QueryParamsOne {
    orderFields?: string[];
    groupFields?: string[];
    limit?: number;
    offset?: number;
}

export interface ServiceRequestFilterParams {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    assignedTo?: string;
}

export type ServiceRequestModel = ModelCtor<Model<ServiceRequestAttributes, ServiceRequestCreateAttributes>>;

export type InboundMapModel = ModelCtor<Model<InboundMapAttributes, InboundMapCreateAttributes>>;

export type JurisdictionModel = ModelCtor<Model<JurisdictionAttributes, JurisdictionCreateAttributes>>;

export type StaffUserModel = ModelCtor<Model<StaffUserAttributes, StaffUserCreateAttributes>>;

export type StaffUserDepartmentModel = ModelCtor<Model<StaffUserDepartmentAttributes, StaffUserDepartmentCreateAttributes>>;

export type ServiceModel = ModelCtor<Model<ServiceAttributes, ServiceCreateAttributes>>;

export type ServiceRequestCommentModel = ModelCtor<Model<ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes>>;

export type CommunicationModel = ModelCtor<Model<CommunicationAttributes, CommunicationCreateAttributes>>;

export type DepartmentModel = ModelCtor<Model<DepartmentAttributes, DepartmentCreateAttributes>>;

export type ChannelStatusModel = ModelCtor<Model<ChannelStatusAttributes, ChannelStatusCreateAttributes>>;

export type MessageDisambiguationModel = ModelCtor<Model<MessageDisambiguationAttributes, MessageDisambiguationCreateAttributes>>;

export interface Models {
    Jurisdiction: JurisdictionModel,
    StaffUser: StaffUserModel,
    StaffUserDepartment: StaffUserDepartmentModel,
    Service: ServiceModel,
    ServiceRequest: ServiceRequestModel,
    InboundMap: InboundMapModel,
    ServiceRequestComment: ServiceRequestCommentModel,
    Communication: CommunicationModel,
    Department: DepartmentModel,
    ChannelStatus: ChannelStatusModel,
    MessageDisambiguation: MessageDisambiguationModel
}
