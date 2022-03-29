import { Request, Response, Router } from 'express';
import multer from 'multer';
import { wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';
import { EmailEventAttributes } from '../../types';
import { GovFlowEmitter } from '../event-listeners';
import { EMAIL_EVENT_IGNORE } from './models';

export const communicationsRouter = Router();

// public route for web hook integration
communicationsRouter.post('/inbound/email', multer().none(), wrapHandler(async (req: Request, res: Response) => {
    const { InboundEmail } = res.app.repositories;
    const { Communication: dispatchHandler } = res.app.services;
    const record = await InboundEmail.createServiceRequest(req.body);
    GovFlowEmitter.emit('serviceRequestCreate', req.jurisdiction, record, dispatchHandler);
    res.status(200).send({ data: { status: 200, message: "Received inbound email" } });
}))

// public route for web hook integration
communicationsRouter.post('/events/email', wrapHandler(async (req: Request, res: Response) => {
    const { EmailStatus } = res.app.repositories;
    const emailEvents = req.body as unknown as EmailEventAttributes[];
    for (const event of emailEvents) {
        if (!EMAIL_EVENT_IGNORE.includes(event.event)) { await EmailStatus.createFromEvent(event); }
    }
    res.status(200).send({ data: { status: 200, message: "Received email event" } });
}))

communicationsRouter.get('/status/email/:email',
    wrapHandler(resolveJurisdiction()),
    enforceJurisdictionAccess,
    wrapHandler(async (req: Request, res: Response) => {
        const { EmailStatus } = res.app.repositories;
        // We enforce jurisdiction access for security, but actually
        // our email delivery status is global, not by jurisdiction
        // So the jurisdiction is not used in the data query.
        const base64Email = req.params.email;
        const email = Buffer.from(base64Email, 'base64url').toString('ascii');
        const record = await EmailStatus.findOne(email);
        res.status(200).send({ data: record });
    }))

communicationsRouter.post('/create-map',
    wrapHandler(resolveJurisdiction()),
    enforceJurisdictionAccess,
    wrapHandler(async (req: Request, res: Response) => {
        const { InboundEmail } = res.app.repositories;
        const data = Object.assign({}, req.body, { jurisdictionId: req.jurisdiction.id });
        const record = await InboundEmail.createMap(data);
        res.status(200).send({ data: record });
    }))
