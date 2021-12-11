import { Container } from 'inversify';
import { CommunicationRepository } from '../core/communications';
import { EventRepository } from '../core/events';
import { JurisdictionRepository } from '../core/jurisdictions';
import { Open311ServiceRepository, Open311ServiceRequestRepository } from '../core/open311';
import { ServiceRequestRepository } from '../core/service-requests';
import { ServiceRepository } from '../core/services';
import { StaffUserRepository } from '../core/staff-users';
import type { AppSettings, ICommunicationRepository, IEventRepository, IJurisdictionRepository, IOpen311ServiceRepository, IOpen311ServiceRequestRepository, IServiceRepository, IServiceRequestRepository, IStaffUserRepository, Plugin } from '../types';
import { DatabaseEngine, Repositories } from '../types';

export const repositoryIds = {
    IJurisdictionRepository: Symbol('IJurisdictionRepository'),
    IStaffUserRepository: Symbol('IStaffUserRepository'),
    IServiceRequestRepository: Symbol('IServiceRequestRepository'),
    IServiceRepository: Symbol('IServiceRepository'),
    IOpen311ServiceRepository: Symbol('IOpen311ServiceRepository'),
    IOpen311ServiceRequestRepository: Symbol('IOpen311ServiceRequestRepository'),
    IEventRepository: Symbol('IEventRepository'),
    ICommunicationRepository: Symbol('ICommunicationRepository'),
};

function bindImplementationsFromPlugins(
    pluginRegistry: Plugin[],
    databaseEngine: DatabaseEngine,
    settings: AppSettings,
): Repositories {

    // default repository bindings
    const repositoryContainer = new Container();
    repositoryContainer.bind<IJurisdictionRepository>(repositoryIds.IJurisdictionRepository).to(JurisdictionRepository);
    repositoryContainer.bind<IStaffUserRepository>(repositoryIds.IStaffUserRepository).to(StaffUserRepository);
    repositoryContainer.bind<IServiceRepository>(repositoryIds.IServiceRepository).to(ServiceRepository);
    repositoryContainer.bind<IServiceRequestRepository>(repositoryIds.IServiceRequestRepository).to(
        ServiceRequestRepository
    );
    repositoryContainer.bind<IOpen311ServiceRepository>(repositoryIds.IOpen311ServiceRepository).to(
        Open311ServiceRepository
    );
    repositoryContainer.bind<IOpen311ServiceRequestRepository>(repositoryIds.IOpen311ServiceRequestRepository).to(
        Open311ServiceRequestRepository
    );
    repositoryContainer.bind<IEventRepository>(repositoryIds.IEventRepository).to(EventRepository);
    repositoryContainer.bind<ICommunicationRepository>(repositoryIds.ICommunicationRepository).to(
        CommunicationRepository
    );

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
    const Open311ServiceRequest = repositoryContainer.get<IOpen311ServiceRequestRepository>(
        repositoryIds.IOpen311ServiceRequestRepository
    );
    const Event = repositoryContainer.get<IEventRepository>(repositoryIds.IEventRepository);
    const Communication = repositoryContainer.get<ICommunicationRepository>(repositoryIds.ICommunicationRepository);

    const repositories = {
        Jurisdiction,
        StaffUser,
        Service,
        ServiceRequest,
        Open311Service,
        Open311ServiceRequest,
        Event,
        Communication
    }

    // Allow repositories access to all of our app settings
    Jurisdiction.settings = settings
    StaffUser.settings = settings
    Service.settings = settings
    ServiceRequest.settings = settings
    Open311Service.settings = settings
    Open311ServiceRequest.settings = settings
    Event.settings = settings
    Communication.settings = settings

    // Allow repositories access to all of our database models
    Jurisdiction.models = databaseEngine.models
    StaffUser.models = databaseEngine.models
    Service.models = databaseEngine.models
    ServiceRequest.models = databaseEngine.models
    Open311Service.models = databaseEngine.models
    Open311ServiceRequest.models = databaseEngine.models
    Event.models = databaseEngine.models
    Communication.models = databaseEngine.models

    // Allow repositories access to all other repositories
    Jurisdiction.repositories = repositories
    StaffUser.repositories = repositories
    Service.repositories = repositories
    ServiceRequest.repositories = repositories
    Open311Service.repositories = repositories
    Open311ServiceRequest.repositories = repositories
    Event.repositories = repositories
    Communication.repositories = repositories

    return repositories;
}

export {
    bindImplementationsFromPlugins
};
