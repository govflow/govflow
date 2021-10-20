import { Request, Response, Router } from 'express';
import logger from '../../logging';

export const accountRouter = Router();

accountRouter.get('/staff', async (req: Request, res: Response) => {
    try {
        const { StaffUser } = res.app.repositories;
        const [records, count] = await StaffUser.findAll("CLIENT_ID");
        return res.status(200).send({ data: records, count: count });
    } catch (err) {
        logger.error(err);
        return res.status(500).send(err);
    }
})

accountRouter.get('/staff/:id', async (req: Request, res: Response) => {
    try {
        const { StaffUser } = res.app.repositories;
        const record = await StaffUser.findOne('CLIENT_ID', req.params.id);
        return res.status(200).send({ data: record });
    } catch (err) {
        logger.error(err);
        return res.status(500).send(err);
    }
})
