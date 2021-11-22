import merge from 'deepmerge';
import { Request, Response, Router } from 'express';
import { wrapHandler } from '../../helpers';
import { resolveJurisdiction } from '../../middlewares';

export const serviceRouter = Router();

serviceRouter.use(wrapHandler(resolveJurisdiction()));

serviceRouter.get('/', wrapHandler(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const [records, count] = await Service.findAll(req.jurisdiction.id);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: records, count: count });
}))

serviceRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    const { id } = req.params;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    const data = await Service.findOne(req.jurisdiction.id, id);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: data });
}))

serviceRouter.put('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    const { id } = req.params;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    const record = await Service.update(req.jurisdiction.id, id, req.body);
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    res.status(200).send({ data: record });
}))

serviceRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { Service } = res.app.repositories;
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    const data = merge(req.body, { jurisdictionId: req.jurisdiction.id });
    /* eslint-enable @typescript-eslint/ban-ts-comment */
    const record = await Service.create(data);
    res.status(200).send({ data: record });
}))
