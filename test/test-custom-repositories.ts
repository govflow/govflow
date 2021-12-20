import chai from 'chai';
import type { Application } from 'express';
import { createApp } from '../src/index';

describe('Verify Repository Plugins.', () => {
    let app: Application;

    before(async function () {
        process.env.CONFIG_MODULE_PATH = './test/fixtures/custom-config-custom-repository.ts';
        app = await createApp();
        await app.migrator.up();
    })

    after(async function () {
        process.env.CONFIG_MODULE_PATH = undefined;
        await app.database.drop({});
    })

    it('should provide new query behavior for service repository', async function () {
        const { Service } = app.repositories;
        const jurisdictionId = 'JURISDICTION_ID';
        const id = '1';
        const oneService = await Service.findOne(jurisdictionId, id);
        const [allServices, allServicesCount] = await Service.findAll(jurisdictionId);
        chai.assert(oneService.name === 'Test Service 1');
        chai.assert(allServicesCount === 2);
        chai.assert(allServices[1].id === '2');
        chai.assert(allServices[1].name === 'Test Service 2');
    });

});
