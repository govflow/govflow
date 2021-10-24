import { Request, Response, Router } from 'express';
import { wrapAsync } from '../../helpers';

export const clientRouter = Router();

clientRouter.get('/', wrapAsync(async (req: Request, res: Response) => {
    const { Client } = res.app.repositories;
    const [records, count] = await Client.findAll();
    res.status(200).send({ data: records, count: count });
}))

clientRouter.get('/:id', wrapAsync(async (req: Request, res: Response) => {
    const { Client } = res.app.repositories;
    const record = await Client.findOne(req.params.id);
    res.status(200).send({ data: record });
}))

clientRouter.post('/', wrapAsync(async (req: Request, res: Response) => {
    const { Client } = res.app.repositories;
    const { clientId: id } = req.body;
    const record = await Client.create(id);
    res.status(200).send({ data: record });
}))
