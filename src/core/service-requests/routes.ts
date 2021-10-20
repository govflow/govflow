import { Request, Response, Router } from 'express';
import logger from '../../logging';

export const serviceRequestRouter = Router();

serviceRequestRouter.get('/', async (req: Request, res: Response) => {
    try {
        const { ServiceRequest } = res.app.repositories;
        const { records, count } = await ServiceRequest.findAll("CLIENT_ID");
        return res.status(200).send({ data: records, count: count });
    } catch (err) {
        logger.error(err);
        return res.status(500).send(err);
    }
})

serviceRequestRouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const { ServiceRequest } = res.app.repositories;
        const record = await ServiceRequest.findOne('CLIENT_ID', req.params.id);
        return res.status(200).send({ data: record });
    } catch (err) {
        logger.error(err);
        return res.status(500).send(err);
    }
})
