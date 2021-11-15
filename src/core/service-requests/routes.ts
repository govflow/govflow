import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';

export const serviceRequestRouter = Router();

serviceRequestRouter.get('/statuses/:jurisdictionId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { jurisdictionId } = req.params;
    const record = await ServiceRequest.findStatusList(jurisdictionId);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:jurisdictionId/:serviceRequestId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { jurisdictionId, serviceRequestId } = req.params;
    const record = await ServiceRequest.createComment(jurisdictionId, serviceRequestId, req.body);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/comments/:jurisdictionId/:serviceRequestId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { jurisdictionId, serviceRequestId, id } = req.params;
    const record = await ServiceRequest.updateComment(jurisdictionId, serviceRequestId, id, req.body);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.get('/:jurisdictionId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { jurisdictionId } = req.params;
    const [records, count] = await ServiceRequest.findAll(jurisdictionId);
    res.status(200).send({ data: records, count: count });
}))


serviceRequestRouter.get('/:jurisdictionId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { jurisdictionId, id } = req.params;
    const record = await ServiceRequest.findOne(jurisdictionId, id);
    res.status(200).send({ data: record });
}))

serviceRequestRouter.post('/:jurisdictionId', wrapHandler(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const record = await ServiceRequest.create(req.body);
    res.status(200).send({ data: record });
}))
