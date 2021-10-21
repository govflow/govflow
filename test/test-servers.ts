import chai from 'chai';
import chaiHttp from 'chai-http';
import { name, version } from '../package.json';
import { defaultServer } from '../src/servers';

chai.use(chaiHttp);

let should = chai.should();

describe('Hit Default Server Endpoints', () => {
    it('it should GET Root API information', async () => {
        let server = await defaultServer();
        chai.request(server)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.be.equal(JSON.stringify({ data: { name, version } }));
            });
    });
});
