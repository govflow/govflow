import { Model, ModelAttributes, ModelOptions, QueryInterface, Sequelize } from "sequelize/types";
import { Umzug } from "umzug";

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
