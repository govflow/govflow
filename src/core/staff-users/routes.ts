import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';
import { resolveJurisdiction } from '../../middlewares';

export const accountRouter = Router();

accountRouter.use(wrapHandler(resolveJurisdiction()));

accountRouter.get('/staff', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const [records, count] = await StaffUser.findAll(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/lookup', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const [records, count] = await StaffUser.lookupTable(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/:id', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const { id } = req.params;
    const record = await StaffUser.findOne(req.jurisdiction.id, id);
    res.status(200).send({ data: record });
}))
