import merge from 'deepmerge';
import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';
import { ServiceAttributes } from '../../types';

export const serviceRouter = Router();

serviceRouter.use(wrapHandler(resolveJurisdiction()));
serviceRouter.use(enforceJurisdictionAccess);

serviceRouter.get('/', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRepository } = res.app.repositories;
    const [records, count] = await serviceRepository.findAll(req.jurisdiction.id);
    res.status(200).send({ data: records, count: count });
}))

serviceRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRepository } = res.app.repositories;
    const { id } = req.params;
    const data = await serviceRepository.findOne(req.jurisdiction.id, id);
    res.status(200).send({ data: data });
}))

serviceRouter.put('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRepository } = res.app.repositories;
    const { id } = req.params;
    const record = await serviceRepository.update(req.jurisdiction.id, id, req.body);
    res.status(200).send({ data: record });
}))

serviceRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { serviceRepository } = res.app.repositories;
    const data = merge(req.body, { jurisdictionId: req.jurisdiction.id });
    const record = await serviceRepository.create(data as ServiceAttributes);
    res.status(200).send({ data: record });
}))
