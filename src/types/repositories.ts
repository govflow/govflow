import { IterableQueryResult, QueryResult } from ".";

/* eslint-disable */
export interface Pluggable {

}
/* eslint-enable */

export interface IClientRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (id: string) => Promise<QueryResult>;
    findOneByJurisdiction: (jurisdictionId: string) => Promise<QueryResult>;
}

export interface IStaffUserRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (clientId: string, id: string) => Promise<QueryResult>;
    findAll: (clientId: string, whereParams: Record<string, unknown>) => Promise<[IterableQueryResult, number]>;
}

export interface IServiceRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (clientId: string, id: string) => Promise<QueryResult>;
    findAll: (clientId: string, whereParams: Record<string, unknown>, leafOnly: boolean) => Promise<[IterableQueryResult, number]>;
}

export interface IServiceRequestRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    update: (clientId: string, id: string, data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (clientId: string, id: string) => Promise<QueryResult>;
    findAll: (clientId: string, whereParams: Record<string, unknown>) => Promise<[IterableQueryResult, number]>;
    findStatusList: (id: string) => Promise<Record<string, string>>;
    createComment: (clientId: string, serviceRequestId: string, data: Record<string, unknown>) => Promise<QueryResult>;
    updateComment: (clientId: string, serviceRequestId: string, serviceRequestCommentId: string, data: Record<string, unknown>) => Promise<QueryResult>;
}

export interface IOpen311ServiceRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, code: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string) => Promise<[IterableQueryResult, number]>;
}

export interface IOpen311ServiceRequestRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, whereParams: Record<string, unknown>) => Promise<[IterableQueryResult, number]>;
}

export interface IEventRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (clientId: string, id: string) => Promise<QueryResult>;
    findAll: (clientId: string, whereParams: Record<string, unknown>) => Promise<[IterableQueryResult, number]>;
}
