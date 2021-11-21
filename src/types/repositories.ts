import { Model, ModelCtor } from "sequelize/types";
import { IterableQueryResult, QueryParamsAll, QueryResult } from ".";

/* eslint-disable */
export interface Pluggable {

}
/* eslint-enable */

export interface RepositoryBase extends Pluggable {
    models?: Record<string, ModelCtor<Model<any, any>>>
}

export interface IJurisdictionRepository extends RepositoryBase {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (id: string) => Promise<QueryResult>;
}

export interface IStaffUserRepository extends RepositoryBase {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
    lookupTable: (jurisdictionId: string) => Promise<[IterableQueryResult, number]>;
}

export interface IServiceRepository extends RepositoryBase {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}

export interface IServiceRequestRepository extends RepositoryBase {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    update: (jurisdictionId: string, id: string, data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
    findStatusList: (id: string) => Promise<Record<string, string>>;
    createComment: (jurisdictionId: string, serviceRequestId: string, data: Record<string, unknown>) => Promise<QueryResult>;
    updateComment: (jurisdictionId: string, serviceRequestId: string, serviceRequestCommentId: string, data: Record<string, unknown>) => Promise<QueryResult>;
}

export interface IOpen311ServiceRepository extends RepositoryBase {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, code: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}

export interface IOpen311ServiceRequestRepository extends RepositoryBase {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}

export interface IEventRepository extends RepositoryBase {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}
