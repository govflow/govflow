import chai from 'chai';
import { createApp } from '../src/index';

describe('Try different configuration config.', () => {

    it('should create an app with overriden existing configuration', async () => {
        process.env.CONFIG_MODULE_PATH = './test/fixtures/custom-config.ts';
        const app = await createApp();
        chai.assert(app);
        chai.assert.equal(app.config.myKey, 'myValue');
        chai.assert.equal(app.config.appPort, 9000);
        // chai.assert.equal(app.config.databaseUrl, 'postgres://me:me@localhost:5432/govflow');
        process.env.CONFIG_MODULE_PATH = undefined;
    });

    it('should only use default configuration', async () => {
        const app = await createApp();
        chai.assert(app);
        chai.assert.equal(app.config.appPort, 3000);
    });

});
