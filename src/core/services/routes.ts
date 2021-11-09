import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';

export const serviceRouter = Router();

serviceRouter.get('/:clientId', wrapHandler(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    const { clientId } = req.params;
    const [records, count] = await Service.findAll(clientId);
    res.status(200).send({ data: records, count: count });
}))

serviceRouter.get('/:clientId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    const { clientId, id } = req.params;
    const data = await Service.findOne(clientId, id);
    res.status(200).send({ data: data });
}))
