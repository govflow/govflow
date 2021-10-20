import { Container } from 'inversify';
import { StaffUserRepository } from '../core/accounts';
import { ClientRepository } from '../core/client';
import { ServiceRequestRepository } from '../core/service-requests';
import { ServiceRepository } from '../core/services';
import type { IClientRepository, IServiceRepository, IServiceRequestRepository, IStaffUserRepository, Pluggable, Plugin } from '../types';

export const repositoryIds = {
    IClientRepository: Symbol('IClientRepository'),
    IServiceRequestRepository: Symbol('IServiceRequestRepository'),
    IServiceRepository: Symbol('IServiceRepository'),
    IStaffUserRepository: Symbol('IStaffUserRepository'),
};

// default repository bindings
const repositoryContainer = new Container();
repositoryContainer.bind<IClientRepository>(repositoryIds.IClientRepository).to(ClientRepository);
repositoryContainer.bind<IServiceRequestRepository>(repositoryIds.IServiceRequestRepository).to(ServiceRequestRepository);
repositoryContainer.bind<IServiceRepository>(repositoryIds.IServiceRepository).to(ServiceRepository);
repositoryContainer.bind<IStaffUserRepository>(repositoryIds.IStaffUserRepository).to(StaffUserRepository);

function bindImplementationsFromPlugins(pluginRegistry: Plugin[]): void {
    pluginRegistry.forEach((plugin) => {
        repositoryContainer.rebind(plugin.serviceIdentifier).to(plugin.implementation);
    })
}

function getRespositories(): Record<string, Pluggable> {
    const Client = repositoryContainer.get<IClientRepository>(repositoryIds.IClientRepository);
    const ServiceRequest = repositoryContainer.get<IServiceRequestRepository>(repositoryIds.IServiceRequestRepository);
    const Service = repositoryContainer.get<IServiceRepository>(repositoryIds.IServiceRepository);
    const StaffUser = repositoryContainer.get<IStaffUserRepository>(repositoryIds.IStaffUserRepository);
    return {
        Client,
        ServiceRequest,
        Service,
        StaffUser
    }
}

export {
    getRespositories,
    bindImplementationsFromPlugins
};
