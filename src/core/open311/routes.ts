import { Request, Response, Router } from 'express';
import xmlparser from 'express-xml-bodyparser';
import xml2js from 'xml2js';
import { wrapHandler } from '../../helpers';

export const open311Router = Router();

function isXML(path: string) {
    if (path.endsWith('xml')) { return true } else { return false; }
}

open311Router.get('/', wrapHandler(async (req: Request, res: Response) => {
    res.redirect('/open311/discovery');
}))

open311Router.get('/discovery', wrapHandler(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))

open311Router.get(['/services.json', '/services.xml'], wrapHandler(async (req: Request, res: Response) => {
    const { Open311Service } = res.app.repositories;
    const { jurisdiction_id: jurisdictionId } = req.query;
    const [records, count] = await Open311Service.findAll(jurisdictionId);
    const asXML = isXML(req.path);
    if (asXML) {
        const builder = new xml2js.Builder({ rootName: 'services' });
        res.type('text/xml');
        const XMLBody = builder.buildObject({ service: records })
        res.status(200).send(XMLBody);
    } else {
        res.status(200).send({ data: records, count: count });
    }
}))

open311Router.get(['/services/:service_code.json', '/services/:service_code.xml'], wrapHandler(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))

open311Router.get(['/requests.json', '/requests.xml'], wrapHandler(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))

open311Router.get(['/requests/:service_request_id.json', '/requests/:service_request_id.xml'], wrapHandler(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))

open311Router.post(['/requests.json', '/requests.xml'], xmlparser({ trim: false, explicitArray: false }), wrapHandler(async (req: Request, res: Response) => {
    const { Open311ServiceRequest } = res.app.repositories;
    const record = await Open311ServiceRequest.create(req.body);
    res.status(200).send({ data: record, success: true });
}))

open311Router.get(['/tokens/:token_id.json', '/tokens/:token_id.xml'], wrapHandler(async (req: Request, res: Response) => {
    res.status(501).send("501 Not Implemented");
}))
