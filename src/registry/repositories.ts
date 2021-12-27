import { Container } from 'inversify';
import { CommunicationRepository } from '../core/communications';
import { DepartmentRepository } from '../core/departments';
import { EventRepository } from '../core/events';
import { JurisdictionRepository } from '../core/jurisdictions';
import { Open311ServiceRepository, Open311ServiceRequestRepository } from '../core/open311';
import { ServiceRequestRepository } from '../core/service-requests';
import { ServiceRepository } from '../core/services';
import { StaffUserRepository } from '../core/staff-users';
import type { AppSettings, ICommunicationRepository, IDepartmentRepository, IEventRepository, IJurisdictionRepository, IOpen311ServiceRepository, IOpen311ServiceRequestRepository, IServiceRepository, IServiceRequestRepository, IStaffUserRepository, Plugin } from '../types';
import { DatabaseEngine, Models, Repositories } from '../types';
import { appIds, repositoryIds } from './service-identifiers';

function bindImplementationsFromPlugins(
    pluginRegistry: Plugin[],
    databaseEngine: DatabaseEngine,
    settings: AppSettings,
): Repositories {

    // default repository bindings
    const repositoryContainer = new Container();

    repositoryContainer.bind<AppSettings>(appIds.AppSettings).toConstantValue(settings);
    repositoryContainer.bind<Models>(appIds.Models).toConstantValue(databaseEngine.models as unknown as Models);
    // repositoryContainer.bind<Repositories>(appTypes.Repositories).toConstantValue(settings);

    repositoryContainer.bind<IJurisdictionRepository>(
        repositoryIds.IJurisdictionRepository).to(JurisdictionRepository
    );
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
    repositoryContainer.bind<IDepartmentRepository>(repositoryIds.IDepartmentRepository).to(
        DepartmentRepository
    );

    // bind from plugins
    pluginRegistry.forEach((plugin) => {
        repositoryContainer.rebind(plugin.serviceIdentifier).to(plugin.implementation);
    })

    // get our implementations and return them
    const Jurisdiction = repositoryContainer.get<IJurisdictionRepository>(repositoryIds.IJurisdictionRepository);
    const StaffUser = repositoryContainer.get<IStaffUserRepository>(repositoryIds.IStaffUserRepository);
    const Service = repositoryContainer.get<IServiceRepository>(repositoryIds.IServiceRepository);
    const ServiceRequest = repositoryContainer.get<IServiceRequestRepository>(
        repositoryIds.IServiceRequestRepository
    );
    const Open311Service = repositoryContainer.get<IOpen311ServiceRepository>(
        repositoryIds.IOpen311ServiceRepository
    );
    const Open311ServiceRequest = repositoryContainer.get<IOpen311ServiceRequestRepository>(
        repositoryIds.IOpen311ServiceRequestRepository
    );
    const Event = repositoryContainer.get<IEventRepository>(repositoryIds.IEventRepository);
    const Communication = repositoryContainer.get<ICommunicationRepository>(repositoryIds.ICommunicationRepository);
    const Department = repositoryContainer.get<IDepartmentRepository>(repositoryIds.IDepartmentRepository);

    const repositories = {
        Jurisdiction,
        StaffUser,
        Service,
        ServiceRequest,
        Open311Service,
        Open311ServiceRequest,
        Event,
        Communication,
        Department
    }

    // Allow repositories access to all other repositories
    Jurisdiction.repositories = repositories
    StaffUser.repositories = repositories
    Service.repositories = repositories
    ServiceRequest.repositories = repositories
    Open311Service.repositories = repositories
    Open311ServiceRequest.repositories = repositories
    Event.repositories = repositories
    Communication.repositories = repositories
    Department.repositories = repositories

    return repositories;
}

export {
    bindImplementationsFromPlugins
};
