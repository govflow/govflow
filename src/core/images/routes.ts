import { Request, Response, Router } from 'express';
import Minio from 'minio';
import { wrapHandler } from '../../helpers';
import logger from '../../logging';

async function presignFilename(
    filename: string, storageEndpoint: string, storageAccessKey: string, storageSecretKey: string
    ): Promise<string | null> {
    const client = new Minio.Client({
        endPoint: storageEndpoint,
        port: 9000,
        useSSL: true,
        accessKey: storageAccessKey,
        secretKey: storageSecretKey
    })
    let response: string | null;
    try {
        response = await client.presignedPutObject('uploads', filename)
    } catch(error) {
        const status_code = 400
        const data = { message: 'Error from object storage', status_code: status_code, error: `${error}` }
        logger.error(data);
        response = null;
    }
    return response;
}

export const imageRouter = Router();

imageRouter.post('/presign', wrapHandler(async (req: Request, res: Response) => {
    const { filename } = req.body;
    const { storageEndpoint, storageAccessKey, storageSecretKey } = req.app.config;
    const uploadUrl = presignFilename(
        filename, storageEndpoint as string, storageAccessKey as string, storageSecretKey as string
    )

}))