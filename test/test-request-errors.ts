import chai from 'chai';
import chaiHttp from 'chai-http';
import { defaultServer } from '../src/servers';

chai.use(chaiHttp);

let should = chai.should();

describe('Check responses in common error scenarios', () => {

    it('it should return 404 not found for routes that do not exist', async () => {
        let server = await defaultServer();
        chai.request(server)
            .get('/this-route-does-not-exist')
            .end((err, res) => {
                res.should.have.status(404);
            });
    });

    it('it should return 500 internal server error', async () => {
        let server = await defaultServer();
        chai.request(server)
            .get('/services')
            .end((err, res) => {
                res.should.have.status(500);
            });
    });

});
