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
