import { Request, Response, Router } from 'express';
import multer from 'multer';
import { twiml } from 'twilio';
import { wrapHandler } from '../../helpers';
import { enforceJurisdictionAccess, resolveJurisdiction } from '../../middlewares';
import { EmailEventAttributes, SmsEventAttributes } from '../../types';
import { verifySendGridWebhook } from './helpers';
import { EMAIL_EVENT_IGNORE } from './models';

export const communicationsRouter = Router();

// public route for web hook integration
communicationsRouter.post('/inbound/sms', multer().none(), wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestService } = res.app.services;

    // if we need to disambiguate manually we start a dialog with the submitter here
    const [
        disambiguate,
        disambiguateResponse,
        disambiguatedOriginalMessage,
        disambiguatedPublicId
    ] = await serviceRequestService.disambiguateInboundData(req.body);
    const messageResponse = new twiml.MessagingResponse();
    if (disambiguate) {
        messageResponse.message(disambiguateResponse);
        res.status(200).send(messageResponse.toString());
    } else {
        await serviceRequestService.createServiceRequest(
            req.body, disambiguatedOriginalMessage, disambiguatedPublicId
        );
        res.status(200).send(messageResponse.toString());
    }
}))

// public route for web hook integration
communicationsRouter.post('/inbound/email', multer().none(), wrapHandler(async (req: Request, res: Response) => {
    const { serviceRequestService } = res.app.services;
    await serviceRequestService.createServiceRequest(req.body);
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

    const { emailStatusRepository } = res.app.repositories;
    const emailEvents = req.body as unknown as EmailEventAttributes[];
    for (const event of emailEvents) {
        if (!EMAIL_EVENT_IGNORE.includes(event.event)) { await emailStatusRepository.createFromEvent(event); }
    }
    res.status(200).send({ data: { status: 200, message: "Received email event" } });
}))

// public route for web hook integration
communicationsRouter.post('/events/sms', wrapHandler(async (req: Request, res: Response) => {
    const { smsStatusRepository } = res.app.repositories;
    const event = req.body as unknown as SmsEventAttributes;
    await smsStatusRepository.createFromEvent(event);
    res.status(200).send({ data: { status: 200, message: "Received email event" } });
}))

communicationsRouter.get('/status/email/:email',
    wrapHandler(resolveJurisdiction()),
    enforceJurisdictionAccess,
    wrapHandler(async (req: Request, res: Response) => {
        const { emailStatusRepository } = res.app.repositories;
        // We enforce jurisdiction access for security, but actually
        // our email delivery status is global, not by jurisdiction
        // So the jurisdiction is not used in the data query.
        const base64Email = req.params.email;
        const record = await emailStatusRepository.isAllowed(base64Email);
        res.status(200).send({ data: record });
    }))

communicationsRouter.get('/status/phone/:phone',
    wrapHandler(resolveJurisdiction()),
    enforceJurisdictionAccess,
    wrapHandler(async (req: Request, res: Response) => {
        const { smsStatusRepository } = res.app.repositories;
        // We enforce jurisdiction access for security, but actually
        // our email delivery status is global, not by jurisdiction
        // So the jurisdiction is not used in the data query.
        const base64Phone = req.params.phone;
        const record = await smsStatusRepository.isAllowed(base64Phone);
        res.status(200).send({ data: record });
    }))

communicationsRouter.post('/create-map',
    wrapHandler(resolveJurisdiction()),
    enforceJurisdictionAccess,
    wrapHandler(async (req: Request, res: Response) => {
        const { inboundMessageService } = res.app.services;
        const data = Object.assign({}, req.body, { jurisdictionId: req.jurisdiction.id });
        const record = await inboundMessageService.createMap(data);
        res.status(200).send({ data: record });
    }))
