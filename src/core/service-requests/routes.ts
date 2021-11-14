import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';

export const serviceRequestRouter = Router();

serviceRequestRouter.get('/statuses/:clientId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { clientId } = req.params;
    const record = await ServiceRequest.findStatusList(clientId);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:clientId/:serviceRequestId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { clientId, serviceRequestId } = req.params;
    const record = await ServiceRequest.createComment(clientId, serviceRequestId, req.body);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:clientId/:serviceRequestId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { clientId, serviceRequestId, id } = req.params;
    const record = await ServiceRequest.updateComment(clientId, serviceRequestId, id, req.body);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.get('/:clientId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { clientId } = req.params;
    const [records, count] = await ServiceRequest.findAll(clientId);
    res.status(200).send({ data: records, count: count });
}))


serviceRequestRouter.get('/:clientId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { clientId, id } = req.params;
    const record = await ServiceRequest.findOne(clientId, id);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/:clientId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const record = await ServiceRequest.create(req.body);
    res.status(200).send({ data: record });
}))
