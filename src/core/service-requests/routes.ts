import { Request, Response, Router } from 'express';
import { serviceRequestFiltersToSequelize, wrapHandler } from '../../helpers';
import { resolveJurisdiction } from '../../middlewares';

export const serviceRequestRouter = Router();

serviceRequestRouter.use(wrapHandler(resolveJurisdiction()));

serviceRequestRouter.get('/status-list', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const record = await ServiceRequest.findStatusList(req.jurisdiction.id);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: record });
}))

serviceRequestRouter.get('/stats', async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { dateFrom, dateTo, status, assignedTo } = req.query;
    const queryParams = serviceRequestFiltersToSequelize(
        { dateFrom, dateTo, status, assignedTo } as Record<string, string>
    );
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const record = await ServiceRequest.getStats(req.jurisdiction.id as string, queryParams);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: { countByStats: record } });
});


serviceRequestRouter.post('/status', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { status, serviceRequestId } = req.body;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const record = await ServiceRequest.updateStatus(req.jurisdiction.id, serviceRequestId, status);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/assign', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { assignedTo, serviceRequestId } = req.body;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const record = await ServiceRequest.updateAssignedTo(req.jurisdiction.id, serviceRequestId, assignedTo);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:serviceRequestId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { serviceRequestId } = req.params;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const record = await ServiceRequest.createComment(req.jurisdiction.id, serviceRequestId, req.body);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:serviceRequestId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { serviceRequestId, id } = req.params;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const record = await ServiceRequest.updateComment(req.jurisdiction.id, serviceRequestId, id, req.body);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: record });
}))

serviceRequestRouter.get('/', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { dateFrom, dateTo, status } = req.query;
    const queryParams = serviceRequestFiltersToSequelize({ dateFrom, dateTo, status } as Record<string, string>)
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const [records, count] = await ServiceRequest.findAll(req.jurisdiction.id, queryParams);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: records, count: count });
}))


serviceRequestRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { id } = req.params;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const record = await ServiceRequest.findOne(req.jurisdiction.id, id);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const record = await ServiceRequest.create(req.body);
    res.status(200).send({ data: record });
}))
