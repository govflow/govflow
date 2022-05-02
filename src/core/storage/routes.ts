import { Request, Response, Router } from 'express';
import _ from 'lodash';
import { wrapHandler } from '../../helpers';
import { presignGet, presignPut } from './helpers';

export const storageRouter = Router();

storageRouter.post('/presign-put', wrapHandler(async (req: Request, res: Response) => {
    const { filename } = req.body;
    const {
        storageEndpoint,
        storageBucket,
        storageRegion,
        storageAccessKey,
        storageSecretKey,
        storagePort,
        storageSSL,
    } = req.app.config;
    let uploadUrl: string | null = null;

    if (filename) {
        uploadUrl = await presignPut(
            filename,
            storageEndpoint as string,
            storageBucket as string,
            storageRegion as string,
            storageAccessKey as string,
            storageSecretKey as string,
            storagePort as number,
            storageSSL as boolean
        )
    }

    if (_.isNil(filename)) {
        res.status(400).send({ data: { filename: null, message: 'Received an invalid file name.' } });
    } else if (_.isNil(uploadUrl)) {
        res.status(400).send({ data: { uploadUrl, message: 'Could not generate upload URL.' } });
    } else {
        res.status(200).send({ data: { uploadUrl } });
    }
}))

storageRouter.post('/presign-get', wrapHandler(async (req: Request, res: Response) => {
    const { filename } = req.body;
    const {
        storageEndpoint,
        storageBucket,
        storageRegion,
        storageAccessKey,
        storageSecretKey,
        storagePort,
        storageSSL,
        storageSignedGetExpiry,
    } = req.app.config;
    let retrieveUrl: string | null = null;

    if (filename) {
        retrieveUrl = await presignGet(
            filename,
            storageEndpoint as string,
            storageBucket as string,
            storageRegion as string,
            storageAccessKey as string,
            storageSecretKey as string,
            storagePort as number,
            storageSSL as boolean,
            storageSignedGetExpiry as number
        )
    }

    if (_.isNil(filename)) {
        res.status(400).send({ data: { filename: null, message: 'Received an invalid file name.' } });
    } else if (_.isNil(retrieveUrl)) {
        res.status(400).send({ data: { retrieveUrl, message: 'Could not obtain a retrieve URL.' } });
    } else {
        res.status(200).send({ data: { retrieveUrl } });
    }
}))
