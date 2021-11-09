import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';

export const serviceRequestRouter = Router();

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
