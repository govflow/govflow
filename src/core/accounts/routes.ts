import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';

export const accountRouter = Router();

accountRouter.get('/staff/:jurisdictionId', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const { jurisdictionId } = req.params;
    const [records, count] = await StaffUser.findAll(jurisdictionId);
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/:jurisdictionId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const { jurisdictionId, id } = req.params;
    const record = await StaffUser.findOne(jurisdictionId, id);
    res.status(200).send({ data: record });
}))

accountRouter.get('/jurisdiction/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Jurisdiction } = res.app.repositories;
    const record = await Jurisdiction.findOne(req.params.id);
    res.status(200).send({ data: record });
}))

accountRouter.post('/jurisdiction', wrapHandler(async (req: Request, res: Response) => {
    const { Jurisdiction } = res.app.repositories;
    const { id, jurisdictionId } = req.body;
    const record = await Jurisdiction.create({ id, jurisdictionId });
    res.status(200).send({ data: record });
}))
