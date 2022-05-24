import chai from 'chai';
import { createApp } from '../src/index';
import { MyServiceRepositoryPlugin } from './fixtures/repositories';

describe('Try different appSettings shapes.', function () {

    it('should accept no appSettings', async function () {
        process.env.CONFIG_MODULE_PATH = undefined;
        const app = await createApp();
        chai.assert(app);
    });

    it('should accept appConfig with plugins', async function () {
        process.env.CONFIG_MODULE_PATH = './test/fixtures/custom-config.ts';
        const app = await createApp();
        chai.assert(app.plugins.repositories.length === 1);
        chai.assert(app.plugins.repositories[0].serviceIdentifier === MyServiceRepositoryPlugin.serviceIdentifier);
        process.env.CONFIG_MODULE_PATH = undefined;
    });

});
