import { Model, ModelAttributes, ModelOptions, Sequelize } from "sequelize/types";

export type DatabaseEngine = Sequelize;

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
    limit?: number,
    offset?: number,
}

export interface ServiceRequestFilterParams {
    dateFrom?: string,
    dateTo?: string,
    status?: string
}