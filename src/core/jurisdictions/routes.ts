import { Request, Response, Router } from 'express';
import { verifySenderRequest } from '../../email';
import { wrapHandler } from '../../helpers';

export const jurisdictionRouter = Router();

jurisdictionRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Jurisdiction } = res.app.repositories;
    const record = await Jurisdiction.findOne(req.params.id);
    res.status(200).send({ data: record });
}))

jurisdictionRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { Jurisdiction } = res.app.repositories;
    const { id, name, email } = req.body;
    const record = await Jurisdiction.create({ id, name, email });
    res.status(200).send({ data: record });
}))

jurisdictionRouter.put('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { Jurisdiction } = res.app.repositories;
    const { id } = req.params;
    const record = await Jurisdiction.update(id, req.body);
    res.status(200).send({ data: record });
}))

jurisdictionRouter.post('/verify-sender-request',
    wrapHandler(async (req: Request, res: Response) => {
        const { sendFromEmail, replyToEmail, name, address, city, state, country, zip } = req.jurisdiction;
        const { sendGridApiKey } = res.app.config;
        if (sendFromEmail) {
            const response = await verifySenderRequest(
                sendGridApiKey, sendFromEmail, replyToEmail, name, address, city, state, country, zip
            );
            if (response.statusCode != 200) {
                res.status(response.statusCode).send({ data: { message: 'Something went wrong' } })
            }
        } else {
            res.status(400).send({
                data: { message: 'This jurisdiction does not have a send from address configured' }
            })
        }
        res.status(200).send({ data: { message: 'Verify sender request successfully sent' } });
    }))
