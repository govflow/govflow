import cors from 'cors';
import type { Request, RequestHandler, Response } from 'express';
import { json, Router, urlencoded } from 'express';
import { wrapHandler } from '../helpers';
import { internalServerError, notFound } from '../middlewares';
import type { ModelDefinition, PluginBase } from '../types';
import { ChannelStatusModel, CommunicationModel, CommunicationRepository, communicationsRouter, EmailStatusRepository, InboundMapModel } from './communications';
import { DepartmentModel, DepartmentRepository, departmentRouter } from './departments';
import { JurisdictionModel, JurisdictionRepository, jurisdictionRouter } from './jurisdictions';
import { open311Router } from './open311';
import { ServiceRequestCommentModel, ServiceRequestModel, ServiceRequestRepository, serviceRequestRouter } from './service-requests';
import { ServiceModel, ServiceRepository, serviceRouter } from './services';
import { accountRouter, StaffUserDepartmentModel, StaffUserModel, StaffUserRepository } from './staff-users';
import { storageRouter } from './storage';

const coreRoutes = Router();

coreRoutes.get('/', wrapHandler(async (req: Request, res: Response) => {
    res.status(200).send({ data: { name: 'govflow', version: '0.0.85-alpha' } });
}))
coreRoutes.use('/services', serviceRouter);
coreRoutes.use('/service-requests', serviceRequestRouter);
coreRoutes.use('/accounts', accountRouter);
coreRoutes.use('/communications', communicationsRouter);
coreRoutes.use('/jurisdictions', jurisdictionRouter);
coreRoutes.use('/departments', departmentRouter);
coreRoutes.use('/storage', storageRouter);
coreRoutes.use('/open311/v2', open311Router);
coreRoutes.use(notFound, internalServerError);

const coreModels: ModelDefinition[] = [
    JurisdictionModel,
    ServiceRequestModel,
    ServiceRequestCommentModel,
    ServiceModel,
    StaffUserModel,
    StaffUserDepartmentModel,
    CommunicationModel,
    DepartmentModel,
    InboundMapModel,
    ChannelStatusModel
]

const coreRepositories: PluginBase[] = [
    JurisdictionRepository,
    ServiceRequestRepository,
    ServiceRepository,
    StaffUserRepository,
    CommunicationRepository,
    DepartmentRepository,
    EmailStatusRepository,
]

const coreMiddlewares: RequestHandler[] = [
    cors(),
    json(),
    urlencoded({ extended: true })
]

export {
    coreRoutes,
    coreModels,
    coreRepositories,
    coreMiddlewares,
    internalServerError,
    notFound
};
