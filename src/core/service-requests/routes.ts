import { Request, Response, Router } from 'express';
import { serviceRequestFiltersToSequelize, wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';
import { ServiceRequestAttributes, StaffUserAttributes } from '../../types';
import { GovFlowEmitter } from '../event-listeners';
import { SERVICE_REQUEST_CLOSED_STATES } from '../service-requests';

export const serviceRequestRouter = Router();

serviceRequestRouter.use(wrapHandler(resolveJurisdiction()));
serviceRequestRouter.use(enforceJurisdictionAccess);

serviceRequestRouter.get('/status-list', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const record = await ServiceRequest.findStatusList(req.jurisdiction.id);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.get('/stats', async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { dateFrom, dateTo, status, assignedTo } = req.query;
    const queryParams = serviceRequestFiltersToSequelize(
        { dateFrom, dateTo, status, assignedTo } as Record<string, string>
    );
    const record = await ServiceRequest.getStats(req.jurisdiction.id as string, queryParams);
    res.status(200).send({ data: { countByStats: record } });
});

serviceRequestRouter.post('/status', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { Communication: dispatchHandler } = res.app.services;
    const { status, serviceRequestId } = req.body;
    let eventName = 'serviceRequestChangeStatus';
    const record = await ServiceRequest.updateStatus(
        req.jurisdiction.id, serviceRequestId, status, req.user as StaffUserAttributes | undefined
    );
    if (SERVICE_REQUEST_CLOSED_STATES.includes(status as string)) {
        eventName = 'serviceRequestClosed'
    }
    GovFlowEmitter.emit(eventName, req.jurisdiction, record, dispatchHandler);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/assign', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { Communication: dispatchHandler } = res.app.services;
    const { assignedTo, serviceRequestId } = req.body;
    const record = await ServiceRequest.updateAssignedTo(
        req.jurisdiction.id, serviceRequestId, assignedTo, req.user as StaffUserAttributes | undefined
    );
    GovFlowEmitter.emit('serviceRequestChangeAssignedTo', req.jurisdiction, record, dispatchHandler);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/department', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { departmentId, serviceRequestId } = req.body;
    const record = await ServiceRequest.updateDepartment(
        req.jurisdiction.id, serviceRequestId, departmentId, req.user as StaffUserAttributes | undefined);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/service', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { serviceId, serviceRequestId } = req.body;
    const record = await ServiceRequest.updateService(
        req.jurisdiction.id, serviceRequestId, serviceId, req.user as StaffUserAttributes | undefined
    );
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:serviceRequestId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { serviceRequestId } = req.params;
    const data = Object.assign({}, req.body, {addedBy: req.user?.id});
    const record = await ServiceRequest.createComment(req.jurisdiction.id, serviceRequestId, data);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:serviceRequestId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { serviceRequestId, id } = req.params;
    const record = await ServiceRequest.updateComment(req.jurisdiction.id, serviceRequestId, id, req.body);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.get('/', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { dateFrom, dateTo, status, assignedTo, department } = req.query;
    const queryParams = serviceRequestFiltersToSequelize(
        { dateFrom, dateTo, status, assignedTo, department } as Record<string, string>,
    );
    const [records, count] = await ServiceRequest.findAll(req.jurisdiction.id, queryParams);
    res.status(200).send({ data: records, count: count });
}))


serviceRequestRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { id } = req.params;
    const record = await ServiceRequest.findOne(req.jurisdiction.id, id);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { Communication: dispatchHandler } = res.app.services;
    const record = await ServiceRequest.create(req.body as ServiceRequestAttributes);
    GovFlowEmitter.emit('serviceRequestCreate', req.jurisdiction, record, dispatchHandler);
    res.status(200).send({ data: record });
}))
