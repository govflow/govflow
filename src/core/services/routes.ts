import { Request, Response, Router } from 'express';
import logger from '../../logging';
export const serviceRouter = Router();

serviceRouter.get('/', async (req: Request, res: Response) => {
    try {
        const { services } = res.app.repositories;
        const { rows: records, count } = await services.findAll("CLIENT_ID");
        return res.status(200).send({ data: records, count: count });
    } catch (err) {
        logger.error(err);
        return res.status(500).send(err);
    }
})

serviceRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const { services } = res.app.repositories;
        const data = await services.findOne('CLIENT_ID', req.params.id);
        return res.status(200).send({ data: data });
    } catch (err) {
        logger.error(err);
        return res.status(500).send(err);
    }
})
