import chai from 'chai';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyServiceRepositoryPlugin } from './fixtures/repository-plugins';

describe('Verify Repository Plugins.', () => {

    it('should provide new query behaviour for service repository', async () => {
        let appSettings = { plugins: [MyServiceRepositoryPlugin] }
        let app = await createApp(appSettings as AppSettings);
        let { services } = app.repositories;
        let clientId = '1';
        let code = '1';
        let oneService = await services.findOne(clientId, code);
        let allServices = await services.findAll(clientId);
        chai.assert(allServices.length === 2);
        chai.assert(allServices[1].code === '2');
        chai.assert(allServices[1].name === 'Test Service 2');
    });

});
