import chai from 'chai';
import type { Application } from 'express';
import { databaseEngine } from '../src/db';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyBlogPostModel, MyServiceModel } from './fixtures/models';

describe('Verify Custom Models.', () => {

    let app: Application;

    before(async () => {
        let appSettings = { models: [MyServiceModel, MyBlogPostModel] };
        app = await createApp(appSettings as AppSettings);
    })

    it('should override a core model, adding an additional column', async () => {
        let modelFields = Object.keys(databaseEngine.models.Service.rawAttributes);
        chai.assert(modelFields.includes('internal_comments'));
    });

    it('should produce an additional model to the core models', async () => {
        chai.assert(databaseEngine.models.BlogPost);
    });

});
