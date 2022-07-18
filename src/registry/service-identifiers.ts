
export const repositoryIds = {
    IJurisdictionRepository: Symbol('IJurisdictionRepository'),
    IStaffUserRepository: Symbol('IStaffUserRepository'),
    IServiceRequestRepository: Symbol('IServiceRequestRepository'),
    IServiceRepository: Symbol('IServiceRepository'),
    IEventRepository: Symbol('IEventRepository'),
    ICommunicationRepository: Symbol('ICommunicationRepository'),
    IEmailStatusRepository: Symbol('IEmailStatusRepository'),
    IDepartmentRepository: Symbol('IDepartmentRepository'),
    IInboundMapRepository: Symbol('IInboundMapRepository'),
    IMessageDisambiguationRepository: Symbol('IMessageDisambiguationRepository'),
};

export const serviceIds = {
    IOutboundMessageService: Symbol('IOutboundMessageService'),
    IInboundMessageService: Symbol('IInboundMessageService'),
    IServiceRequestService: Symbol('IServiceRequestService'),
    IStaffUserService: Symbol('IStaffUserService'),
};

export const appIds = {
    AppConfig: Symbol('AppConfig'),
    Models: Symbol('Models'),
    Repositories: Symbol('Repositories'),
};
