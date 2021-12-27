import cors from 'cors';
import type { Request, RequestHandler, Response } from 'express';
import { json, Router } from 'express';
import { wrapHandler } from '../helpers';
import { internalServerError, notFound } from '../middlewares';
import type { ModelDefinition, PluginBase } from '../types';
import { CommunicationModel, CommunicationRepository } from './communications';
import { DepartmentModel, DepartmentRepository, departmentRouter } from './departments';
import { EventModel, EventRepository } from './events';
import { JurisdictionModel, JurisdictionRepository, jurisdictionRouter } from './jurisdictions';
import { open311Router } from './open311';
import { ServiceRequestCommentModel, ServiceRequestModel, ServiceRequestRepository, serviceRequestRouter } from './service-requests';
import { ServiceModel, ServiceRepository, serviceRouter } from './services';
import { accountRouter, StaffUserModel, StaffUserRepository } from './staff-users';

const coreRoutes = Router();

coreRoutes.get('/', wrapHandler(async (req: Request, res: Response) => {
    res.status(200).send({ data: { name: 'govflow', version: '0.0.19-alpha' } });
}))
coreRoutes.use('/services', serviceRouter);
coreRoutes.use('/service-requests', serviceRequestRouter);
coreRoutes.use('/accounts', accountRouter);
coreRoutes.use('/jurisdictions', jurisdictionRouter);
coreRoutes.use('/departments', departmentRouter);
coreRoutes.use('/open311/v2', open311Router);
coreRoutes.use(notFound, internalServerError);

const coreModels: ModelDefinition[] = [
    JurisdictionModel,
    ServiceRequestModel,
    ServiceRequestCommentModel,
    ServiceModel,
    StaffUserModel,
    EventModel,
    CommunicationModel,
    DepartmentModel,
]

const coreRepositories: PluginBase[] = [
    JurisdictionRepository,
    ServiceRequestRepository,
    ServiceRepository,
    StaffUserRepository,
    EventRepository,
    CommunicationRepository,
    DepartmentRepository
]

const coreMiddlewares: RequestHandler[] = [
    cors(),
    json(),
]

export {
    coreRoutes,
    coreModels,
    coreRepositories,
    coreMiddlewares,
    internalServerError,
    notFound
};
