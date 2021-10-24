import chai from 'chai';
import chaiHttp from 'chai-http';
import type { Application } from 'express';
import type { Server } from 'http';
import _ from 'lodash';
import { createApp } from '../src/index';
import { validServicePayload } from './fixtures/open311';

chai.use(chaiHttp);

async function open311Server(): Promise<[Application, Server]> {
    const app = await createApp();
    const clientId = 'CLIENT_ID';
    let { Service, Client } = app.repositories;
    await Client.create({ id: clientId });
    for (const service of _.cloneDeep(validServicePayload)) {
        await Service.create(clientId, service);
    }
    return [app, app.listen(4000, () => { })];
}

describe('Verify Open311 support.', () => {
    let app: Application;
    let clientId: string;
    let server: Server;

    before(async () => {
        [app, server] = await open311Server();
        clientId = 'CLIENT_ID';
    })

    // after(async () => {
    //     // await app.database.drop()
    // })

    it('should find an Open311 record correctly', async () => {
        let { Service } = app.repositories;
        let record = await Service.findOne(clientId, validServicePayload[0].service_code);
        chai.assert(record.name === record.service_name);
        chai.assert(record.id === record.service_code);
        chai.assert(record.parentId === record.group);
    });

    it('should return an Open311 services list as JSON', async () => {
        chai.request(server)
            .get('/open311/services.json')
            .end((err, res) => {
                chai.assert.equal(res.status, 200);
                chai.assert(res.body.count === 3);
                chai.assert.equal(res.type, 'application/json');
            });
    });

});
