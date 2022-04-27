
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
};

export const serviceIds = {
    IOutboundMessageService: Symbol('IOutboundMessageService'),
    IInboundMessageService: Symbol('IInboundMessageService'),
};

export const appIds = {
    AppSettings: Symbol('AppSettings'),
    Models: Symbol('Models'),
    Repositories: Symbol('Repositories'),
};
