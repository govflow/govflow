import { Request, Response, Router } from 'express';
import multer from 'multer';
import { wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';
import { GovFlowEmitter } from '../event-listeners';

export const communicationsRouter = Router();

communicationsRouter.post('/create-map',
    wrapHandler(resolveJurisdiction()),
    enforceJurisdictionAccess,
    wrapHandler(async (req: Request, res: Response) => {
        const { InboundEmail } = res.app.repositories;
        const data = Object.assign({}, req.body, { jurisdictionId: req.jurisdiction.id });
        const record = await InboundEmail.createMap(data);
        res.status(200).send({ data: record });
    }))

communicationsRouter.post('/inbound/email', multer().none(), wrapHandler(async (req: Request, res: Response) => {
    const { InboundEmail } = res.app.repositories;
    const { Communication: dispatchHandler } = res.app.services;
    const record = await InboundEmail.createServiceRequest(req.body);
    GovFlowEmitter.emit('serviceRequestCreate', req.jurisdiction, record, dispatchHandler);
    res.status(200).send({ data: { status: 200, message: "Received inbound email" } });
}))
