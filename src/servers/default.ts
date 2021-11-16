import { Server } from 'http';
import { createApp } from '../index';
import logger from '../logging';

async function defaultServer(): Promise<Server> {
    const app = await createApp();
    const port = app.config.get('app_port');
    return app.listen(port, () => {
        logger.info(`application listening on ${port}.`)
    });
}

export default defaultServer;
