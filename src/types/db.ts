import { Model, ModelAttributes, ModelCtor, ModelOptions, QueryInterface, Sequelize } from "sequelize/types";
import { Umzug } from "umzug";
import { CommunicationAttributes, CommunicationCreateAttributes, DepartmentAttributes, DepartmentCreateAttributes, EventAttributes, EventCreateAttributes, JurisdictionAttributes, JurisdictionCreateAttributes, ServiceAttributes, ServiceCreateAttributes, ServiceRequestAttributes, ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes, ServiceRequestCreateAttributes, StaffUserAttributes, StaffUserCreateAttributes } from ".";

export type DatabaseEngine = Sequelize;
export type MigrationEngine = Umzug<QueryInterface>;

export interface ModelDefinition {
    name: string,
    attributes: ModelAttributes,
    options?: ModelOptions
}

export type QueryResult = Model | Record<string, unknown> | null;

export type IterableQueryResult = QueryResult[];

export type UnknownQueryResult = QueryResult | IterableQueryResult;

export interface QueryParamsOne {
    whereParams?: Record<string, unknown>,
    selectFields?: string[],

}

export interface QueryParamsAll extends QueryParamsOne {
    orderFields?: string[],
    groupFields?: string[],
    limit?: number,
    offset?: number,
}

export interface ServiceRequestFilterParams {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    assignedTo?: string;
}

export interface Models {
    Jurisdiction: ModelCtor<Model<JurisdictionAttributes, JurisdictionCreateAttributes>>,
    StaffUser: ModelCtor<Model<StaffUserAttributes, StaffUserCreateAttributes>>,
    Service: ModelCtor<Model<ServiceAttributes, ServiceCreateAttributes>>,
    ServiceRequest: ModelCtor<Model<ServiceRequestAttributes, ServiceRequestCreateAttributes>>,
    ServiceRequestComment: ModelCtor<Model<ServiceRequestCommentAttributes, ServiceRequestCommentCreateAttributes>>,
    Event: ModelCtor<Model<EventAttributes, EventCreateAttributes>>,
    Communication: ModelCtor<Model<CommunicationAttributes, CommunicationCreateAttributes>>,
    Department: ModelCtor<Model<DepartmentAttributes, DepartmentCreateAttributes>>,
}
