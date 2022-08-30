import { RequestHandler } from 'express';
import { Container } from 'inversify';
import { CommunicationRepository, EmailStatusRepository, InboundMapRepository, MessageDisambiguationRepository, SmsStatusRepository } from '../core/communications';
import { InboundMessageService, OutboundMessageService } from '../core/communications/services';
import { DepartmentRepository } from '../core/departments';
import { ServiceRequestHookRunner } from '../core/hooks';
import { JurisdictionRepository } from '../core/jurisdictions';
import { ServiceRequestRepository, ServiceRequestService } from '../core/service-requests';
import { ServiceRepository } from '../core/services';
import { StaffUserRepository } from '../core/staff-users';
import { StaffUserService } from '../core/staff-users/services';
import type { AppConfig, ICommunicationRepository, IDepartmentRepository, IEmailStatusRepository, IInboundMapRepository, IInboundMessageService, IJurisdictionRepository, IMessageDisambiguationRepository, IServiceRepository, IServiceRequestHookRunner, IServiceRequestRepository, IServiceRequestService, ISmsStatusRepository, IStaffUserRepository, IStaffUserService, MiddlewarePlugin, Services } from '../types';
import { Models, Repositories } from '../types';
import { appIds, repositoryIds, serviceIds } from './service-identifiers';

function bindRepositoriesWithPlugins(
    config: AppConfig,
): Repositories {
    // default repository bindings
    const repositoryContainer = new Container();

    repositoryContainer.bind<AppConfig>(appIds.AppConfig).toConstantValue(config);
    repositoryContainer.bind<Models>(appIds.Models).toConstantValue(config.database?.models as unknown as Models);

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
    repositoryContainer.bind<ISmsStatusRepository>(repositoryIds.ISmsStatusRepository).to(
        SmsStatusRepository
    );
    repositoryContainer.bind<IDepartmentRepository>(repositoryIds.IDepartmentRepository).to(
        DepartmentRepository
    );
    repositoryContainer.bind<IInboundMapRepository>(repositoryIds.IInboundMapRepository).to(
        InboundMapRepository
    );
    repositoryContainer.bind<IMessageDisambiguationRepository>(repositoryIds.IMessageDisambiguationRepository).to(
        MessageDisambiguationRepository
    );

    // bind from plugins if we have any, to override our default bindings
    if (config.plugins?.repositories) {
        config.plugins.repositories.forEach((plugin) => {
            repositoryContainer.rebind(plugin.serviceIdentifier).to(plugin.implementation);
        })
    }

    // get our implementations and return them
    const jurisdictionRepository = repositoryContainer.get<IJurisdictionRepository>(
        repositoryIds.IJurisdictionRepository);
    const staffUserRepository = repositoryContainer.get<IStaffUserRepository>(repositoryIds.IStaffUserRepository
    );
    const serviceRepository = repositoryContainer.get<IServiceRepository>(repositoryIds.IServiceRepository);
    const serviceRequestRepository = repositoryContainer.get<IServiceRequestRepository>(
        repositoryIds.IServiceRequestRepository
    );
    const communicationRepository = repositoryContainer.get<ICommunicationRepository>(
        repositoryIds.ICommunicationRepository
    );
    const emailStatusRepository = repositoryContainer.get<IEmailStatusRepository>(
        repositoryIds.IEmailStatusRepository
    );
    const smsStatusRepository = repositoryContainer.get<ISmsStatusRepository>(
        repositoryIds.ISmsStatusRepository
    );
    const departmentRepository = repositoryContainer.get<IDepartmentRepository>(repositoryIds.IDepartmentRepository);
    const inboundMapRepository = repositoryContainer.get<IInboundMapRepository>(repositoryIds.IInboundMapRepository);
    const messageDisambiguationRepository = repositoryContainer.get<IMessageDisambiguationRepository>(
        repositoryIds.IMessageDisambiguationRepository
    );

    const repositories = {
        jurisdictionRepository,
        staffUserRepository,
        serviceRepository,
        serviceRequestRepository,
        communicationRepository,
        emailStatusRepository,
        smsStatusRepository,
        departmentRepository,
        inboundMapRepository,
        messageDisambiguationRepository
    }
    return repositories;
}

function bindServicesWithPlugins(
    config: AppConfig,
    repositories: Repositories,
): Services {
    // default service bindings
    const serviceContainer = new Container();

    const dispatchHandler = new OutboundMessageService(repositories, config);
    const serviceRequestHookRunner = new ServiceRequestHookRunner(dispatchHandler);

    serviceContainer.bind<AppConfig>(appIds.AppConfig).toConstantValue(config);
    serviceContainer.bind<Repositories>(appIds.Repositories).toConstantValue(repositories);
    serviceContainer.bind<IServiceRequestHookRunner>(
        appIds.ServiceRequestHookRunner
    ).toConstantValue(serviceRequestHookRunner);

    serviceContainer.bind<IInboundMessageService>(serviceIds.IInboundMessageService).to(InboundMessageService);
    serviceContainer.bind<IServiceRequestService>(serviceIds.IServiceRequestService).to(ServiceRequestService);
    serviceContainer.bind<IStaffUserService>(serviceIds.IStaffUserService).to(StaffUserService);

    // bind from plugins if we have any, to override our default bindings
    if (config.plugins?.services) {
        config.plugins.services.forEach((plugin) => {
            serviceContainer.rebind(plugin.serviceIdentifier).to(plugin.implementation);
        })
    }

    // get our implementations and return them
    const inboundMessageService = serviceContainer.get<IInboundMessageService>(serviceIds.IInboundMessageService);
    const serviceRequestService = serviceContainer.get<IServiceRequestService>(serviceIds.IServiceRequestService);
    const staffUserService = serviceContainer.get<IStaffUserService>(serviceIds.IStaffUserService);

    const services = {
        inboundMessageService,
        serviceRequestService,
        staffUserService
    }
    return services;
}

function bindMiddlewaresWithPlugins(middlewarePlugins: MiddlewarePlugin[] | undefined): RequestHandler[] {
    const middlewares = [];
    if (middlewarePlugins) {
        for (const middlewarePlugin of middlewarePlugins) {
            let middleware: RequestHandler;
            if (middlewarePlugin.makeMiddlewareArgs && middlewarePlugin.makeMiddlewareArgs.length > 0) {
                middleware = middlewarePlugin.makeMiddleware(...middlewarePlugin.makeMiddlewareArgs)
            } else {
                middleware = middlewarePlugin.makeMiddleware()
            }
            middlewares.push(middleware)
        }
    }
    return middlewares;
}

export function bindImplementationsWithPlugins(config: AppConfig): {
    repositories: Repositories,
    services: Services,
    middlewares: RequestHandler[]
} {
    const repositories = bindRepositoriesWithPlugins(config);
    const services = bindServicesWithPlugins(config, repositories);
    const middlewares = bindMiddlewaresWithPlugins(config.plugins?.middlewares);
    return { repositories, services, middlewares };
}
