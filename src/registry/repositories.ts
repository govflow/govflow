import { Container } from 'inversify';
import { EventRepository } from '../core/events';
import { JurisdictionRepository } from '../core/jurisdictions';
import { Open311ServiceRepository, Open311ServiceRequestRepository } from '../core/open311';
import { ServiceRequestRepository } from '../core/service-requests';
import { ServiceRepository } from '../core/services';
import { StaffUserRepository } from '../core/staff-users';
import type { IEventRepository, IJurisdictionRepository, IOpen311ServiceRepository, IOpen311ServiceRequestRepository, IServiceRepository, IServiceRequestRepository, IStaffUserRepository, Plugin } from '../types';

export const repositoryIds = {
    IJurisdictionRepository: Symbol('IJurisdictionRepository'),
    IStaffUserRepository: Symbol('IStaffUserRepository'),
    IServiceRequestRepository: Symbol('IServiceRequestRepository'),
    IServiceRepository: Symbol('IServiceRepository'),
    IOpen311ServiceRepository: Symbol('IOpen311ServiceRepository'),
    IOpen311ServiceRequestRepository: Symbol('IOpen311ServiceRequestRepository'),
    IEventRepository: Symbol('IEventRepository'),
};

function bindImplementationsFromPlugins(pluginRegistry: Plugin[]): Record<string, unknown> {

    // default repository bindings
    const repositoryContainer = new Container();
    repositoryContainer.bind<IJurisdictionRepository>(repositoryIds.IJurisdictionRepository).to(JurisdictionRepository);
    repositoryContainer.bind<IStaffUserRepository>(repositoryIds.IStaffUserRepository).to(StaffUserRepository);
    repositoryContainer.bind<IServiceRepository>(repositoryIds.IServiceRepository).to(ServiceRepository);
    repositoryContainer.bind<IServiceRequestRepository>(repositoryIds.IServiceRequestRepository).to(ServiceRequestRepository);
    repositoryContainer.bind<IOpen311ServiceRepository>(repositoryIds.IOpen311ServiceRepository).to(Open311ServiceRepository);
    repositoryContainer.bind<IOpen311ServiceRequestRepository>(repositoryIds.IOpen311ServiceRequestRepository).to(Open311ServiceRequestRepository);
    repositoryContainer.bind<IEventRepository>(repositoryIds.IEventRepository).to(EventRepository);

    // bind from plugins
    pluginRegistry.forEach((plugin) => {
        repositoryContainer.rebind(plugin.serviceIdentifier).to(plugin.implementation);
    })

    // get our implementations and return them
    const Jurisdiction = repositoryContainer.get<IJurisdictionRepository>(repositoryIds.IJurisdictionRepository);
    const StaffUser = repositoryContainer.get<IStaffUserRepository>(repositoryIds.IStaffUserRepository);
    const Service = repositoryContainer.get<IServiceRepository>(repositoryIds.IServiceRepository);
    const ServiceRequest = repositoryContainer.get<IServiceRequestRepository>(repositoryIds.IServiceRequestRepository);
    const Open311Service = repositoryContainer.get<IOpen311ServiceRepository>(repositoryIds.IOpen311ServiceRepository);
    const Open311ServiceRequest = repositoryContainer.get<IOpen311ServiceRequestRepository>(repositoryIds.IOpen311ServiceRequestRepository);
    const Event = repositoryContainer.get<IEventRepository>(repositoryIds.IEventRepository);
    return {
        Jurisdiction,
        StaffUser,
        Service,
        ServiceRequest,
        Open311Service,
        Open311ServiceRequest,
        Event
    }
}

export {
    bindImplementationsFromPlugins
};
