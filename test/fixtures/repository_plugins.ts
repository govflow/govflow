import { injectable } from 'inversify';
import { repositoryIds } from '../../src/registry/repositories';
import { IServiceRepository, Plugin } from '../../src/types';

@injectable()
class MyServiceRepository implements IServiceRepository {
    async findOne(clientId: string, code: string) {
        return new Promise<object>((resolve, reject) => { return resolve({ clientId: clientId, code: code, name: 'Test Service 1' }) });
    }
    async findAll(clientId: string) {
        return new Promise<object[]>((resolve, reject) => { return resolve([{ clientId: clientId, code: '1', name: 'Test Service 1' }, { clientId: clientId, code: '2', name: 'Test Service 2' }]) })
    }
}

let MyServiceRepositoryPlugin: Plugin = {
    serviceIdentifier: repositoryIds.IServiceRepository,
    implementation: MyServiceRepository
}

export {
    MyServiceRepositoryPlugin
};
