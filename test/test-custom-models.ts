import chai from 'chai';
import type { Application } from 'express';
import { createApp } from '../src/index';

describe('Verify Custom Models.', () => {

    let app: Application;

    before(async function () {
        process.env.CONFIG_MODULE_PATH = './test/fixtures/custom-config-custom-models.ts';
        app = await createApp();
        await app.migrator.up();
    });

    after(async function () {
        process.env.CONFIG_MODULE_PATH = undefined;
        // await app.database.drop({});
    });

    it('should override a core model, adding an additional column', async function () {
        let modelFields = Object.keys(app.database.models.Service.rawAttributes);
        chai.assert(modelFields.includes('internal_comments'));
    });

    it('should produce an additional model to the core models', async function () {
        chai.assert(app.database.models.BlogPost);
    });

});
