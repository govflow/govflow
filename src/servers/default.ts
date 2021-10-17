import { Server } from 'http';
import { createApp } from '../index';
import logger from '../logging';

const APP_PORT: number = parseInt(process.env.APP_PORT || '3000');

async function defaultServer(): Promise<Server> {
    const app = await createApp();
    return app.listen(APP_PORT, () => {
        logger.info(`application listening on ${APP_PORT}.`)
    });
}

export default defaultServer;
