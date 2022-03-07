import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';

export const jurisdictionRouter = Router();

jurisdictionRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Jurisdiction } = res.app.repositories;
    const record = await Jurisdiction.findOne(req.params.id);
    res.status(200).send({ data: record });
}))

jurisdictionRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { Jurisdiction } = res.app.repositories;
    const { id, name, email } = req.body;
    const record = await Jurisdiction.create({ id, name, email });
    res.status(200).send({ data: record });
}))

jurisdictionRouter.put('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Jurisdiction } = res.app.repositories;
    const { id } = req.params;
    const record = await Jurisdiction.update(id, req.body);
    res.status(200).send({ data: record });
}))
