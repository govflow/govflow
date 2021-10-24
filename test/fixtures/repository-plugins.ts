import { injectable } from 'inversify';
import { repositoryIds } from '../../src/registry/repositories';
import { IServiceRepository, IterableQueryResult, Plugin, QueryResult } from '../../src/types';

@injectable()
class MyServiceRepository implements IServiceRepository {

    async findOne(clientId: string, id: string) {
        return new Promise<QueryResult>((resolve, reject) => { return resolve({ clientId: clientId, id: id, name: 'Test Service 1' }) });
    }

    async findAll(clientId: string) {
        return new Promise<[IterableQueryResult, number]>((resolve, reject) => {
            return resolve([[
                { clientId: clientId, id: '1', name: 'Test Service 1' },
                { clientId: clientId, id: '2', name: 'Test Service 2' }
            ], 2])
        })
    }

    async create(clientId: string, payload: Record<string, unknown>) {
        payload;
        return new Promise<QueryResult>((resolve, reject) => { return resolve({ clientId: clientId, id: '3', name: 'Test Service 3' }) });
    }

}

@injectable()
class MyBrokenServiceRepository implements IServiceRepository {
    // @ts-ignore
    async findOne(clientId: string, id: string) {
        throw Error()
    }
    // @ts-ignore
    async findAll(clientId: string) {
        return new Promise<[IterableQueryResult, number]>((resolve, reject) => {
            throw Error()
        })
    }
    // @ts-ignore
    async create(clientId: string, payload: Record<string, unknown>) {
        throw Error()
    }

}

export const MyServiceRepositoryPlugin: Plugin = {
    serviceIdentifier: repositoryIds.IServiceRepository,
    implementation: MyServiceRepository
}

export const MyBrokenServiceRepositoryPlugin: Plugin = {
    serviceIdentifier: repositoryIds.IServiceRepository,
    implementation: MyBrokenServiceRepository
}
