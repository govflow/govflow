import { Request, Response, Router } from 'express';
import { wrapAsync } from '../../helpers';

export const accountRouter = Router();

accountRouter.get('/staff', wrapAsync(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const [records, count] = await StaffUser.findAll("CLIENT_ID");
    res.status(200).send({ data: records, count: count });

}))

accountRouter.get('/staff/:id', wrapAsync(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const record = await StaffUser.findOne('CLIENT_ID', req.params.id);
    res.status(200).send({ data: record });
}))

accountRouter.get('/client', wrapAsync(async (req: Request, res: Response) => {
    const { Client } = res.app.repositories;
    const [records, count] = await Client.findAll();
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/client/:id', wrapAsync(async (req: Request, res: Response) => {
    const { Client } = res.app.repositories;
    const record = await Client.findOne(req.params.id);
    res.status(200).send({ data: record });
}))

accountRouter.post('/client', wrapAsync(async (req: Request, res: Response) => {
    const { Client } = res.app.repositories;
    const { clientId: id } = req.body;
    const record = await Client.create(id);
    res.status(200).send({ data: record });
}))
