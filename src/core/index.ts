import { Router } from 'express';
import type { ModelDefinition, Pluggable } from '../types';
import { accountRouter, StaffUserModel, StaffUserRepository } from './accounts';
import { ClientModel, ClientRepository } from './client';
import { ServiceRequestModel, ServiceRequestRepository, serviceRequestRouter } from './service-requests';
import { ServiceModel, ServiceRepository, serviceRouter } from './services';

const coreRoutes = Router();

coreRoutes.use('/services', serviceRouter);
coreRoutes.use('/service-requests', serviceRequestRouter);
coreRoutes.use('/accounts', accountRouter);

const coreModels: ModelDefinition[] = [
    ClientModel,
    ServiceRequestModel,
    ServiceModel,
    StaffUserModel,
]

const coreRepositories: Pluggable[] = [
    ClientRepository,
    ServiceRequestRepository,
    ServiceRepository,
    StaffUserRepository
]

export {
    coreRoutes,
    coreModels,
    coreRepositories
};
