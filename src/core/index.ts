import { Router } from 'express';
import type { Model, Repository } from '../types';
import { ServiceModel, ServiceRepository, serviceRouter } from './services';

const coreRoutes = Router();

coreRoutes.use('/services', serviceRouter);

const coreModels: Model[] = [
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
