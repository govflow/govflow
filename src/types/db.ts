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
