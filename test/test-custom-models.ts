import chai from 'chai';
import { databaseEngine } from '../src/db';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyBlogPostModel, MyServiceModel } from './fixtures/models';

describe('Verify Custom Models.', () => {

    it('should override a core model, adding an additional column', async () => {
        let appSettings = { models: [MyServiceModel] };
        await createApp(appSettings as AppSettings);
        let modelFields = Object.keys(databaseEngine.models.Service.rawAttributes);
        chai.assert(modelFields.includes('internal_comments'));
    });

    it('should produce an additional model to the core models', async () => {
        let appSettings = { models: [MyBlogPostModel] };
        await createApp(appSettings as AppSettings);
        chai.assert(databaseEngine.models.BlogPost);
    });

});
