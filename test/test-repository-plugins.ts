import chai from 'chai';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyServiceRepositoryPlugin } from './fixtures/repository-plugins';

describe('Verify Repository Plugins.', () => {

    it('should provide new query behavior for service repository', async () => {
        let appSettings = { plugins: [MyServiceRepositoryPlugin] }
        let app = await createApp(appSettings as AppSettings);
        let { services } = app.repositories;
        let clientId = '1';
        let id = '1';
        let oneService = await services.findOne(clientId, id);
        let [allServices, allServicesCount] = await services.findAll(clientId);
        chai.assert(oneService.name === 'Test Service 1');
        chai.assert(allServicesCount === 2);
        chai.assert(allServices[1].id === '2');
        chai.assert(allServices[1].name === 'Test Service 2');
    });

});
