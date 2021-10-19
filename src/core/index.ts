import { Router } from 'express';
import type { ModelDefinition, Repository } from '../types';
import { ServiceModel, ServiceRepository, serviceRouter } from './services';

const coreRoutes = Router();

coreRoutes.use('/services', serviceRouter);

const coreModels: ModelDefinition[] = [
    ServiceModel
]

const coreRepositories: Repository[] = [
    ServiceRepository
]

export {
    coreRoutes,
    coreModels,
    coreRepositories
};
