import { Request, Response, Router } from 'express';
import multer from 'multer';
import { wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';
import { EmailEventAttributes, JurisdictionAttributes } from '../../types';
import { GovFlowEmitter } from '../event-listeners';
import { verifySendGridWebhook } from './helpers';
import { EMAIL_EVENT_IGNORE } from './models';

export const communicationsRouter = Router();

// public route for web hook integration
communicationsRouter.post('/inbound/email', multer().none(), wrapHandler(async (req: Request, res: Response) => {
    const { InboundEmail, Jurisdiction } = res.app.repositories;
    const { Communication: dispatchHandler } = res.app.services;
    const [record, recordCreated] = await InboundEmail.createServiceRequest(req.body);
    const jurisdiction = await Jurisdiction.findOne(record.jurisdictionId) as JurisdictionAttributes;

    let eventName = 'serviceRequestCreate';
    if (recordCreated) {
        GovFlowEmitter.emit(eventName, jurisdiction, record, dispatchHandler);
    } else {
        eventName = 'serviceRequestCommentBroadcast';
        GovFlowEmitter.emit(eventName, jurisdiction, record, dispatchHandler);
    }
    res.status(200).send({ data: { status: 200, message: "Received inbound email" } });
}))

// public route for web hook integration
communicationsRouter.post('/events/email', wrapHandler(async (req: Request, res: Response) => {
    const { sendGridSignedWebhookVerificationKey } = res.app.config;
    let verified;
    if (sendGridSignedWebhookVerificationKey) {
        // we are allowing unverified events IF this variable is not set
        // it really does need to be set for production use
        const signature = res.getHeader('X-Twilio-Email-Event-Webhook-Signature');
        const timestamp = res.getHeader('X-Twilio-Email-Event-Webhook-Timestamp');
        verified = verifySendGridWebhook(
            sendGridSignedWebhookVerificationKey as string,
            req.body as EmailEventAttributes,
            signature as string | undefined,
            timestamp as string | undefined
        );
    }

    if (sendGridSignedWebhookVerificationKey && !verified) {
        res.status(403).send({ data: { status: 403, message: "Unverified POST" } });
    }

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
