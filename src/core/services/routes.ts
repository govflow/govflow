import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';

export const serviceRouter = Router();

serviceRouter.get('/:jurisdictionId', wrapHandler(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    const { jurisdictionId } = req.params;
    const [records, count] = await Service.findAll(jurisdictionId);
    res.status(200).send({ data: records, count: count });
}))

serviceRouter.get('/:jurisdictionId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    const { jurisdictionId, id } = req.params;
    const data = await Service.findOne(jurisdictionId, id);
    res.status(200).send({ data: data });
}))
