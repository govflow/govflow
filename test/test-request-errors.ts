import chai from 'chai';
import chaiHttp from 'chai-http';
import type { Server } from 'http';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyBrokenServiceRepositoryPlugin } from './fixtures/repository-plugins';

chai.use(chaiHttp);

async function brokenServer(): Promise<Server> {
    const appSettings = { plugins: [MyBrokenServiceRepositoryPlugin] };
    const app = await createApp(appSettings as AppSettings);
    return app.listen(3000, () => { });
}

describe('Check responses in common error scenarios', () => {
    let server: Server;

    before(async () => {
        server = await brokenServer();
    })

    it('it should return 404 not found for routes that do not exist', async () => {
        chai.request(server)
            .get('/this-route-does-not-exist')
            .end((err, res) => {
                chai.assert.equal(res.status, 404);
            });
    });

    it('it should return 500 internal server error', async () => {
        chai.request(server)
            .get('/services')
            .end((err, res) => {
                chai.assert.equal(res.status, 500);
            });
    });

});
