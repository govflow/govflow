import cors from 'cors';
import type { Request, RequestHandler, Response } from 'express';
import { json, Router } from 'express';
import { name, version } from '../../package.json';
import { wrapAsync } from '../helpers';
import { internalServerError, notFound } from '../middlewares';
import type { ModelDefinition, Pluggable } from '../types';
import { accountRouter, ClientModel, ClientRepository, StaffUserModel, StaffUserRepository, verifyClientMiddleware } from './accounts';
import { open311Router } from './open311';
import { ServiceRequestModel, ServiceRequestRepository, serviceRequestRouter } from './service-requests';
import { ServiceModel, ServiceRepository, serviceRouter } from './services';

const coreRoutes = Router();

coreRoutes.get('/', wrapAsync(async (req: Request, res: Response) => {
    res.status(200).send({ data: { name, version } });
}))
coreRoutes.use('/services', serviceRouter);
coreRoutes.use('/service-requests', serviceRequestRouter);
coreRoutes.use('/accounts', accountRouter);
coreRoutes.use('/open311', open311Router);
coreRoutes.use(notFound, internalServerError);

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

const coreMiddlewares: RequestHandler[] = [
    cors(),
    json(),
    verifyClientMiddleware
]

export {
    coreRoutes,
    coreModels,
    coreRepositories,
    coreMiddlewares,
    internalServerError,
    notFound
};
