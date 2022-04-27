import { Container } from 'inversify';
import { CommunicationRepository, EmailStatusRepository, InboundMapRepository } from '../core/communications';
import { InboundMessageService, OutboundMessageService } from '../core/communications/services';
import { DepartmentRepository } from '../core/departments';
import { JurisdictionRepository } from '../core/jurisdictions';
import { ServiceRequestRepository } from '../core/service-requests';
import { ServiceRepository } from '../core/services';
import { StaffUserRepository } from '../core/staff-users';
import type { AppSettings, ICommunicationRepository, IDepartmentRepository, IEmailStatusRepository, IInboundMapRepository, IInboundMessageService, IJurisdictionRepository, IOutboundMessageService, IServiceRepository, IServiceRequestRepository, IStaffUserRepository, Plugin, Services } from '../types';
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
    repositoryContainer.bind<ICommunicationRepository>(repositoryIds.ICommunicationRepository).to(
        CommunicationRepository
    );
    repositoryContainer.bind<IEmailStatusRepository>(repositoryIds.IEmailStatusRepository).to(
        EmailStatusRepository
    );
    repositoryContainer.bind<IDepartmentRepository>(repositoryIds.IDepartmentRepository).to(
        DepartmentRepository
    );
    repositoryContainer.bind<IInboundMapRepository>(repositoryIds.IInboundMapRepository).to(
        InboundMapRepository
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
    const Communication = repositoryContainer.get<ICommunicationRepository>(repositoryIds.ICommunicationRepository);
    const EmailStatus = repositoryContainer.get<IEmailStatusRepository>(repositoryIds.IEmailStatusRepository);
    const Department = repositoryContainer.get<IDepartmentRepository>(repositoryIds.IDepartmentRepository);
    const InboundMap = repositoryContainer.get<IInboundMapRepository>(repositoryIds.IInboundMapRepository);

    const repositories = {
        Jurisdiction,
        StaffUser,
        Service,
        ServiceRequest,
        Communication,
        EmailStatus,
        Department,
        InboundMap
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

    serviceContainer.bind<IOutboundMessageService>(serviceIds.IOutboundMessageService).to(OutboundMessageService);
    serviceContainer.bind<IInboundMessageService>(serviceIds.IInboundMessageService).to(InboundMessageService);

    // TODO: Bind custom services from plugins here

    // get our implementations and return them
    const OutboundMessage = serviceContainer.get<IOutboundMessageService>(serviceIds.IOutboundMessageService);
    const InboundMessage = serviceContainer.get<IInboundMessageService>(serviceIds.IInboundMessageService);

    const services = {
        OutboundMessage,
        InboundMessage
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
