import chai from 'chai';
import chaiHttp from 'chai-http';
import type { Server } from 'http';
import { name, version } from '../package.json';
import { defaultServer } from '../src/servers';

chai.use(chaiHttp);

describe('Hit Default Server Endpoints', () => {
    let server: Server;

    before(async () => {
        server = await defaultServer();
    })

    it('it should GET Root API information', async () => {
        chai.request(server)
            .get('/')
            .end((err, res) => {
                chai.assert.equal(res.status, 200);
                chai.assert.equal(res.text, JSON.stringify({ data: { name, version } }));
            });
    });
});
