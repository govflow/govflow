import { Model, ModelAttributes, ModelCtor, ModelOptions, QueryInterface, Sequelize } from "sequelize/types";
import { Umzug } from "umzug";
import { CommunicationAttributes, CommunicationCreateAttributes, DepartmentAttributes, DepartmentCreateAttributes, JurisdictionAttributes, JurisdictionCreateAttributes, ServiceAttributes, ServiceCreateAttributes, ServiceRequestAttributes, ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes, ServiceRequestCreateAttributes, StaffUserAttributes, StaffUserCreateAttributes } from ".";
import { ChannelStatusAttributes, ChannelStatusCreateAttributes, InboundMapAttributes, InboundMapCreateAttributes } from "./data";

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

export type IChannelStatusModel = ModelCtor<Model<ChannelStatusAttributes, ChannelStatusCreateAttributes>>;

export interface Models {
    Jurisdiction: ModelCtor<Model<JurisdictionAttributes, JurisdictionCreateAttributes>>;
    StaffUser: ModelCtor<Model<StaffUserAttributes, StaffUserCreateAttributes>>;
    Service: ModelCtor<Model<ServiceAttributes, ServiceCreateAttributes>>;
    ServiceRequest: ServiceRequestModel;
    ServiceRequestComment: ModelCtor<Model<ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes>>;
    Communication: ModelCtor<Model<CommunicationAttributes, CommunicationCreateAttributes>>;
    Department: ModelCtor<Model<DepartmentAttributes, DepartmentCreateAttributes>>;
    InboundMap: InboundMapModel;
    ChannelStatus: IChannelStatusModel;
}
