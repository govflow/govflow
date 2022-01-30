import _ from 'lodash';
import { Client } from 'minio';
import logger from '../../logging';
import type { MinioClientConfig } from './types';

export function getClient(config: MinioClientConfig): Client {
    return new Client({
        endPoint: config.endpoint,
        port: config.port,
        useSSL: config.useSSL,
        accessKey: config.accessKey,
        secretKey: config.secretKey
    })
}

export async function ensureBucket(client: Client, bucketName: string, bucketRegion: string): Promise<string> {
    const exists = client.bucketExists(bucketName);
    if (_.isNil(exists)) {
        await client.makeBucket(bucketName, bucketRegion)
    }
    return bucketName;
}

export async function presignPut(
    filename: string,
    storageEndpoint: string,
    storageBucket: string,
    storageRegion: string,
    storageAccessKey: string,
    storageSecretKey: string,
    storagePort: number,
    storageSSL: boolean,
    ): Promise<string | null> {
    const client = getClient({
        endpoint: storageEndpoint,
        port: storagePort,
        useSSL: storageSSL,
        accessKey: storageAccessKey,
        secretKey: storageSecretKey
    })
    let response: string | null;
    try {
        await ensureBucket(client, storageBucket, storageRegion);
        response = await client.presignedPutObject(storageBucket, filename)
    } catch(error) {
        const status_code = 400
        const data = { message: 'Error from object storage', status_code: status_code, error: `${error}` }
        logger.error(data);
        response = null;
    }
    return response;
}

export async function presignGet(
    filename: string,
    storageEndpoint: string,
    storageBucket: string,
    storageRegion: string,
    storageAccessKey: string,
    storagePresignSecretKey: string,
    storagePort: number,
    storageSSL: boolean,
    storageSignedGetExpiry: number
    ): Promise<string | null> {
    const client = getClient({
        endpoint: storageEndpoint,
        port: storagePort,
        useSSL: storageSSL,
        accessKey: storageAccessKey,
        secretKey: storagePresignSecretKey
    })
    let response: string | null;
    try {
        response = await client.presignedGetObject(storageBucket, filename, storageSignedGetExpiry)
    } catch(error) {
        const status_code = 400
        const data = { message: 'Error from object storage', status_code: status_code, error: `${error}` }
        logger.error(data);
        response = null;
    }
    return response;
}
