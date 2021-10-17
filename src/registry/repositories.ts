import { Container } from 'inversify';
import { ServiceRepository } from '../core/services';
import type { IServiceRepository, Plugin } from '../types';

export const repositoryIds = {
    IServiceRepository: Symbol('IServiceRepository'),
};

// default repository bindings
const repositoryContainer = new Container();

repositoryContainer.bind<IServiceRepository>(repositoryIds.IServiceRepository).to(ServiceRepository);

function bindImplementationsFromPlugins(pluginRegistry: Plugin[]): void {
    pluginRegistry.forEach((plugin) => {
        repositoryContainer.rebind(plugin.serviceIdentifier).to(plugin.implementation);
    })
}

function getRespositories(): Record<string, unknown> {
    const services = repositoryContainer.get<IServiceRepository>(repositoryIds.IServiceRepository);
    return {
        services
    }
}

export {
    getRespositories,
    bindImplementationsFromPlugins
};
