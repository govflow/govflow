import { Request, Response, Router } from 'express';
import { verifySenderRequest } from '../../email';
import { wrapHandler } from '../../helpers';

export const jurisdictionRouter = Router();

jurisdictionRouter.get('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { jurisdictionRepository } = res.app.repositories;
    const record = await jurisdictionRepository.findOne(req.params.id);
    res.status(200).send({ data: record });
}))

jurisdictionRouter.post('/', wrapHandler(async (req: Request, res: Response) => {
    const { jurisdictionRepository } = res.app.repositories;
    const { id, name, email } = req.body;
    const record = await jurisdictionRepository.create({ id, name, email });
    res.status(200).send({ data: record });
}))

jurisdictionRouter.put('/:id', wrapHandler(async (req: Request, res: Response) => {
    const { jurisdictionRepository } = res.app.repositories;
    const { id } = req.params;
    const record = await jurisdictionRepository.update(id, req.body);
    res.status(200).send({ data: record });
}))

jurisdictionRouter.post('/verify-sender-request',
    wrapHandler(async (req: Request, res: Response) => {
        const { jurisdictionRepository } = res.app.repositories;
        const { jurisdictionRepositoryId } = req.body;
        const jurisdiction = await jurisdictionRepository.findOne(jurisdictionRepositoryId);
        const { sendFromEmail, replyToEmail, name, address, city, state, country, zip } = jurisdiction;
        const { sendGridApiKey } = res.app.config;
        let response;
        if (!jurisdiction.sendFromEmail) {
            res.status(400).send({
                data: { message: 'This jurisdictionRepository does not have a send from address configured' }
            })
        } else if (sendFromEmail) {
            response = await verifySenderRequest(
                sendGridApiKey, sendFromEmail, replyToEmail, name, address, city, state, country, zip
            );

        }
        if (!response || response.statusCode != 200) {
            res.status(500).send({ data: { message: 'Something went wrong' } })
        } else {
            res.status(200).send({ data: { message: 'Verify sender request successfully sent' } });

        }
    }))
