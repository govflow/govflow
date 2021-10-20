import chai from 'chai';
import { createApp } from '../src/index';
import { validServicePayload } from './fixtures/open311';

describe('Ensure that Open311 attributes are settable and gettable.', () => {

    it('should save an Open311 service payload correctly', async () => {
        let app = await createApp();
        let { Service, Client } = app.repositories;
        let clientId = '1';
        await Client.create({ id: clientId });
        await Service.create(clientId, validServicePayload[0]);
        let oneService = await Service.findOne(clientId, validServicePayload[0].service_code);
        chai.assert(oneService.name === oneService.service_name);
        chai.assert(oneService.id === oneService.service_code);
        chai.assert(oneService.parentId === oneService.group);
    });

});
