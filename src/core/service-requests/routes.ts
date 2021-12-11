import { Request, Response, Router } from 'express';
import { serviceRequestFiltersToSequelize, wrapHandler } from '../../helpers';
import { resolveJurisdiction } from '../../middlewares';
import { ServiceRequestAttributes } from '../../types';

export const serviceRequestRouter = Router();

serviceRequestRouter.use(wrapHandler(resolveJurisdiction()));

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
    const { status, serviceRequestId } = req.body;
    const record = await ServiceRequest.updateStatus(req.jurisdiction.id, serviceRequestId, status);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/assign', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { assignedTo, serviceRequestId } = req.body;
    const record = await ServiceRequest.updateAssignedTo(req.jurisdiction.id, serviceRequestId, assignedTo);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:serviceRequestId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { serviceRequestId } = req.params;
    const record = await ServiceRequest.createComment(req.jurisdiction.id, serviceRequestId, req.body);
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
    const { dateFrom, dateTo, status, assignedTo } = req.query;
    const queryParams = serviceRequestFiltersToSequelize(
        { dateFrom, dateTo, status, assignedTo } as Record<string, string>,
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
    const record = await ServiceRequest.create(req.body as ServiceRequestAttributes);
    res.status(200).send({ data: record });
}))
