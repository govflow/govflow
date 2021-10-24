import { Request, Response, Router } from 'express';
import { wrapAsync } from '../../helpers';
import { serviceWithout311 } from './helpers';

export const serviceRouter = Router();

serviceRouter.get('/', wrapAsync(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    let [records, count] = await Service.findAll("CLIENT_ID");
    records = records.map(serviceWithout311);
    res.status(200).send({ data: records, count: count });
}))

serviceRouter.get('/:id', wrapAsync(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    const data = await Service.findOne('CLIENT_ID', req.params.id);
    res.status(200).send({ data: data });
}))
