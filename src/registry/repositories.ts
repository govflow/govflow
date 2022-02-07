import { Container } from 'inversify';
import { CommunicationRepository } from '../core/communications';
import { CommunicationService } from '../core/communications/services';
import { DepartmentRepository } from '../core/departments';
import { JurisdictionRepository } from '../core/jurisdictions';
import { Open311ServiceRepository, Open311ServiceRequestRepository } from '../core/open311';
import { ServiceRequestRepository } from '../core/service-requests';
import { ServiceRepository } from '../core/services';
import { StaffUserRepository } from '../core/staff-users';
import type { AppSettings, ICommunicationRepository, ICommunicationService, IDepartmentRepository, IJurisdictionRepository, IOpen311ServiceRepository, IOpen311ServiceRequestRepository, IServiceRepository, IServiceRequestRepository, IStaffUserRepository, Plugin, Services } from '../types';
import { DatabaseEngine, Models, Repositories } from '../types';
import { appIds, repositoryIds, serviceIds } from './service-identifiers';

function bindRepositoriesWithPlugins(
    pluginRegistry: Plugin[],
    databaseEngine: DatabaseEngine,
    settings: AppSettings,
): Repositories {
    // default repository bindings
    const repositoryContainer = new Container();

    repositoryContainer.bind<AppSettings>(appIds.AppSettings).toConstantValue(settings);
    repositoryContainer.bind<Models>(appIds.Models).toConstantValue(databaseEngine.models as unknown as Models);

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
    const Communication = repositoryContainer.get<ICommunicationRepository>(repositoryIds.ICommunicationRepository);
    const Department = repositoryContainer.get<IDepartmentRepository>(repositoryIds.IDepartmentRepository);

    const repositories = {
        Jurisdiction,
        StaffUser,
        Service,
        ServiceRequest,
        Open311Service,
        Open311ServiceRequest,
        Communication,
        Department
    }
    return repositories;
}

function bindServicesWithPlugins(
    pluginRegistry: Plugin[],
    repositories: Repositories,
    settings: AppSettings,
): Services {
    // default service bindings
    const serviceContainer = new Container();

    serviceContainer.bind<AppSettings>(appIds.AppSettings).toConstantValue(settings);
    serviceContainer.bind<Repositories>(appIds.Repositories).toConstantValue(repositories);

    serviceContainer.bind<ICommunicationService>(serviceIds.ICommunicationService).to(CommunicationService);

    // TODO: Bind custom services from plugins here

    // get our implementations and return them
    const Communication = serviceContainer.get<ICommunicationService>(serviceIds.ICommunicationService);

    const services = {
        Communication
    }
    return services;
}

export function bindImplementationsWithPlugins(
    pluginRegistry: Plugin[],
    databaseEngine: DatabaseEngine,
    settings: AppSettings,
): { repositories: Repositories, services: Services } {
    const repositories = bindRepositoriesWithPlugins(pluginRegistry, databaseEngine, settings);
    const services = bindServicesWithPlugins(pluginRegistry, repositories, settings);
    return { repositories, services };
}
