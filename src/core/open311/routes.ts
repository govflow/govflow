import { Request, Response, Router } from 'express';
import xmlparser from 'express-xml-bodyparser';
import xml2js from 'xml2js';
import { wrapAsync } from '../../helpers';
import { serviceAs311 } from '../services/helpers';

export const open311Router = Router();

function isXML(path: string) {
    if (path.endsWith('xml')) { return true } else { return false; }
}

open311Router.get('/', wrapAsync(async (req: Request, res: Response) => {
    res.redirect('/open311/discovery');
}))

open311Router.get('/discovery', wrapAsync(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))

open311Router.get(['/services.json', '/services.xml'], wrapAsync(async (req: Request, res: Response) => {
    // handle xml requests as we dont currently support
    const asXML = isXML(req.path);
    const { Service } = res.app.repositories;
    const leafOnly = true;
    /* eslint-disable  prefer-const */
    let [records, count] = await Service.findAll("CLIENT_ID", leafOnly);
    /* eslint-enable prefer-const */
    records = records.map(serviceAs311);
    if (asXML) {
        const builder = new xml2js.Builder({ rootName: 'services' });
        res.type('application/xml');
        res.status(200).send(builder.buildObject({ service: records }));
    } else {
        res.status(200).send({ data: records, count: count });
    }
}))

open311Router.get(['/services/:service_code.json', '/services/:service_code.xml'], wrapAsync(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))

open311Router.get(['/requests.json', '/requests.xml'], wrapAsync(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))

open311Router.get(['/requests/:service_request_id.json', '/requests/:service_request_id.xml'], wrapAsync(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))

open311Router.post(['/requests.json', '/requests.xml'], xmlparser({ trim: false, explicitArray: false }), wrapAsync(async (req: Request, res: Response) => {
    const { ServiceRequest } = res.app.repositories;
    const record = await ServiceRequest.create("CLIENT_ID", req.body);
    res.status(200).send({ data: record, success: true });
}))

open311Router.get(['/tokens/:token_id.json', '/tokens/:token_id.xml'], wrapAsync(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))
