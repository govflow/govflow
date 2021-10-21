import { Request, Response, Router } from 'express';
import { wrapAsync } from '../../helpers';

export const serviceRequestRouter = Router();

serviceRequestRouter.get('/', wrapAsync(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const { records, count } = await ServiceRequest.findAll("CLIENT_ID");
    res.status(200).send({ data: records, count: count });
}))

serviceRequestRouter.get('/:id', wrapAsync(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const record = await ServiceRequest.findOne('CLIENT_ID', req.params.id);
    res.status(200).send({ data: record });
}))
