import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';

export const departmentRouter = Router();

departmentRouter.use(wrapHandler(resolveJurisdiction()));
departmentRouter.use(enforceJurisdictionAccess);

departmentRouter.get('/', wrapHandler(async (req: Request, res: Response) => {
    const { departmentRepository } = res.app.repositories;
    const [records, count] = await departmentRepository.findAll(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

departmentRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { departmentRepository } = res.app.repositories;
    const record = await departmentRepository.findOne(req.jurisdiction.id, req.params.id);
    res.status(200).send({ data: record });
}))

departmentRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { departmentRepository } = res.app.repositories;
    const record = await departmentRepository.create(req.body);
    res.status(200).send({ data: record });
}))

departmentRouter.put('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { departmentRepository } = res.app.repositories;
    const { id } = req.params;
    const record = await departmentRepository.update(req.jurisdiction.id, id, req.body);
    res.status(200).send({ data: record });
}))
