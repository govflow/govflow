import { inject, injectable } from 'inversify';
import { appIds, repositoryIds } from '../../src/registry/service-identifiers';
import type { AppConfig, IServiceRepository, Models, RepositoryPlugin, ServiceAttributes } from '../../src/types';

@injectable()
class MyServiceRepository implements IServiceRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
    }

    async findOne(jurisdictionId: string, id: string): Promise<ServiceAttributes> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise<ServiceAttributes>((resolve, reject) => {
            return resolve({ jurisdictionId: jurisdictionId, id: id, name: 'Test Service 1', group: 'my-group' });
        });
    }

    async findAll(jurisdictionId: string): Promise<[ServiceAttributes[], number]> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise<[ServiceAttributes[], number]>((resolve, reject) => {
            return resolve([[
                { jurisdictionId: jurisdictionId, id: '1', name: 'Test Service 1', group: 'my-group' },
                { jurisdictionId: jurisdictionId, id: '2', name: 'Test Service 2', group: 'my-group' }
            ], 2])
        })
    }

    async create(data: ServiceAttributes): Promise<ServiceAttributes> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise<ServiceAttributes>((resolve, reject) => {
            return resolve({
                jurisdictionId: data.jurisdictionId as string,
                id: '3',
                name: 'Test Service 3',
                group: 'my-group'
            })
        });
    }

    async update(jurisdictionId: string, id: string, data: Partial<ServiceAttributes>): Promise<ServiceAttributes> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise<ServiceAttributes>((resolve, reject) => {
            return resolve({
                jurisdictionId: data.jurisdictionId as string,
                id: '3',
                name: 'Test Service 3',
                group: 'my-group'
            })
        });
    }

    async createFrom311(jurisdictionId: string, data: Record<string, unknown>): Promise<ServiceAttributes> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise<ServiceAttributes>((resolve, reject) => {
            return resolve({
                jurisdictionId: data.jurisdictionId as string,
                id: '3',
                name: 'Test Service 3',
                group: 'my-group'
            })
        });
    }

}

@injectable()
class MyBrokenJurisdictionRepository implements IServiceRepository {

    models: Models;
    config: AppConfig;

    constructor(
        @inject(appIds.Models) models: Models,
        @inject(appIds.AppConfig) config: AppConfig,
    ) {
        this.models = models;
        this.config = config
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findOne(jurisdictionId: string, id: string): Promise<ServiceAttributes> {
        throw new Error()
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findAll(jurisdictionId: string): Promise<[ServiceAttributes[], number]> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise<[ServiceAttributes[], number]>((resolve, reject) => {
            throw new Error()
        })
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async create(data: ServiceAttributes): Promise<ServiceAttributes> {
        throw new Error()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async update(jurisdictionId: string, id: string, data: Partial<ServiceAttributes>): Promise<ServiceAttributes> {
        throw new Error()
    }

}

export const MyServiceRepositoryPlugin: RepositoryPlugin = {
    serviceIdentifier: repositoryIds.IServiceRepository,
    implementation: MyServiceRepository
}

export const MyBrokenJurisdictionRepositoryPlugin: RepositoryPlugin = {
    serviceIdentifier: repositoryIds.IJurisdictionRepository,
    implementation: MyBrokenJurisdictionRepository
}