import chai from 'chai';
import type { Application } from 'express';
import { migrator } from '../src/db';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyServiceRepositoryPlugin } from './fixtures/repositories';

describe('Verify Repository Plugins.', () => {
    let app: Application;

    before(async function () {
        let appSettings = { plugins: [MyServiceRepositoryPlugin] }
        app = await createApp(appSettings as AppSettings);
        await migrator.up();
    })

    after(async function () {
        await app.database.drop({});
    })

    it('should provide new query behavior for service repository', async function () {
        let { Service } = app.repositories;
        let jurisdictionId = 'JURISDICTION_ID';
        let id = '1';
        let oneService = await Service.findOne({ jurisdictionId, id });
        let [allServices, allServicesCount] = await Service.findAll(jurisdictionId);
        chai.assert(oneService.name === 'Test Service 1');
        chai.assert(allServicesCount === 2);
        chai.assert(allServices[1].id === '2');
        chai.assert(allServices[1].name === 'Test Service 2');
    });

});
