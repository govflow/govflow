import { Request, Response, Router } from 'express';
import multer from 'multer';
import { wrapHandler } from '../../helpers';

export const communicationsRouter = Router();

communicationsRouter.post('/inbound/email', multer().none(), wrapHandler(async (req: Request, res: Response) => {
    const { InboundEmail } = res.app.repositories;
    await InboundEmail.createServiceRequest(req.body);
    res.status(200).send({ data: {status: 200, message: "Received inbound email"} });
}))
