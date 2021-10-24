import { IterableQueryResult, QueryResult } from ".";

/* eslint-disable */
export interface Pluggable {

}
/* eslint-enable */

export interface IClientRepository extends Pluggable {
    findOne: (id: string) => Promise<QueryResult>;
    create: (payload: Record<string, unknown>) => Promise<QueryResult>;
}

export interface IStaffUserRepository extends Pluggable {
    findOne: (id: string, clientId: string) => Promise<QueryResult>;
    findAll: (clientId: string) => Promise<[IterableQueryResult, number]>;
    create: (clientId: string, payload: Record<string, unknown>) => Promise<QueryResult>;
}

export interface IServiceRepository extends Pluggable {
    findOne: (code: string, clientId: string) => Promise<QueryResult>;
    findAll: (clientId: string, leafOnly: boolean) => Promise<[IterableQueryResult, number]>;
    create: (clientId: string, payload: Record<string, unknown>) => Promise<QueryResult>;
}

export interface IServiceRequestRepository extends Pluggable {
    findOne: (id: string, clientId: string) => Promise<QueryResult>;
    findAll: (clientId: string) => Promise<[IterableQueryResult, number]>;
    create: (clientId: string, payload: Record<string, unknown>) => Promise<QueryResult>;
}
