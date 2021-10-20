import { IterableQueryResult, QueryResult } from ".";

/* eslint-disable */
export interface Pluggable {

}
/* eslint-enable */

export interface IClientRepository extends Pluggable {
    findOne: (id: string) => Promise<QueryResult>;
}

export interface IStaffUserRepository extends Pluggable {
    findOne: (id: string, clientId: string) => Promise<QueryResult>;
    findAll: (clientId: string) => Promise<[IterableQueryResult, number]>;
}

export interface IServiceRepository extends Pluggable {
    findOne: (code: string, clientId: string) => Promise<QueryResult>;
    findAll: (clientId: string) => Promise<[IterableQueryResult, number]>;
}

export interface IServiceRequestRepository extends Pluggable {
    findOne: (id: string, clientId: string) => Promise<QueryResult>;
    findAll: (clientId: string) => Promise<[IterableQueryResult, number]>;
}
