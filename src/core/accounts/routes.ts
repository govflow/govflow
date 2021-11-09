import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';

export const accountRouter = Router();

accountRouter.get('/staff/:clientId', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const { clientId } = req.params;
    const [records, count] = await StaffUser.findAll(clientId);
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/:clientId/:id', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const { clientId, id } = req.params;
    const record = await StaffUser.findOne(clientId, id);
    res.status(200).send({ data: record });
}))

accountRouter.get('/client/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Client } = res.app.repositories;
    const record = await Client.findOne(req.params.id);
    res.status(200).send({ data: record });
}))

accountRouter.post('/client', wrapHandler(async (req: Request, res: Response) => {
    const { Client } = res.app.repositories;
    const { id, jurisdictionId } = req.body;
    const record = await Client.create({ id, jurisdictionId });
    res.status(200).send({ data: record });
}))
