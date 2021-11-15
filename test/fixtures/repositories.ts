import { injectable } from 'inversify';
import { repositoryIds } from '../../src/registry/repositories';
import type { IServiceRepository, IterableQueryResult, Plugin, QueryResult } from '../../src/types';

@injectable()
class MyServiceRepository implements IServiceRepository {

    async findOne(jurisdictionId: string, id: string) {
        return new Promise<QueryResult>((resolve, reject) => { return resolve({ jurisdictionId: jurisdictionId, id: id, name: 'Test Service 1' }) });
    }

    async findAll(jurisdictionId: string) {
        return new Promise<[IterableQueryResult, number]>((resolve, reject) => {
            return resolve([[
                { jurisdictionId: jurisdictionId, id: '1', name: 'Test Service 1' },
                { jurisdictionId: jurisdictionId, id: '2', name: 'Test Service 2' }
            ], 2])
        })
    }

    async create(data: Record<string, unknown>) {
        return new Promise<QueryResult>((resolve, reject) => { return resolve({ jurisdictionId: data.jurisdictionId, id: '3', name: 'Test Service 3' }) });
    }

    async createFrom311(jurisdictionId: string, data: Record<string, unknown>) {
        return new Promise<QueryResult>((resolve, reject) => { return resolve({ jurisdictionId: data.jurisdictionId, id: '3', name: 'Test Service 3' }) });
    }

}

@injectable()
class MyBrokenJurisdictionRepository implements IServiceRepository {
    // @ts-ignore
    async findOne(jurisdictionId: string, id: string) {
        throw new Error()
    }
    // @ts-ignore
    async findAll(jurisdictionId: string) {
        return new Promise<[IterableQueryResult, number]>((resolve, reject) => {
            throw new Error()
        })
    }
    // @ts-ignore
    async create(data: Record<string, unknown>) {
        throw new Error()
    }

}

export const MyServiceRepositoryPlugin: Plugin = {
    serviceIdentifier: repositoryIds.IServiceRepository,
    implementation: MyServiceRepository
}

export const MyBrokenJurisdictionRepositoryPlugin: Plugin = {
    serviceIdentifier: repositoryIds.IJurisdictionRepository,
    implementation: MyBrokenJurisdictionRepository
}