import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';
import { resolveJurisdiction } from '../../middlewares';

export const accountRouter = Router();

accountRouter.use(wrapHandler(resolveJurisdiction()));

accountRouter.get('/staff', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const [records, count] = await StaffUser.findAll(req.jurisdiction.id);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: records, count: count });
}))

accountRouter.get('/staff/:id', wrapHandler(async (req: Request, res: Response) => {
    const { StaffUser } = res.app.repositories;
    const { id } = req.params;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const record = await StaffUser.findOne(req.jurisdiction.id, id);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: record });
}))
