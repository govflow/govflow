import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';
import { resolveJurisdiction } from '../../middlewares';

export const departmentRouter = Router();

departmentRouter.use(wrapHandler(resolveJurisdiction()));

departmentRouter.get('/', wrapHandler(async (req: Request, res: Response) => {
    const { Department } = res.app.repositories;
    const [records, count] = await Department.findAll(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

departmentRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Department } = res.app.repositories;
    const record = await Department.findOne(req.jurisdiction.id, req.params.id);
    res.status(200).send({ data: record });
}))

departmentRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { Department } = res.app.repositories;
    const record = await Department.create(req.body);
    res.status(200).send({ data: record });
}))
