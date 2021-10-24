import chai from 'chai';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyServiceRepositoryPlugin } from './fixtures/repository-plugins';

describe('Try different appSettings shapes.', () => {

    it('should accept no appSettings', async () => {
        let app = await createApp();
        chai.assert(app);
    });

    it('should accept empty appSettings', async () => {
        let appSettings = {}
        let app = await createApp(appSettings as AppSettings);
        chai.assert(app);
    });

    it('should accept appSettings plugins', async () => {
        let appSettings = { plugins: [MyServiceRepositoryPlugin] }
        let app = await createApp(appSettings as AppSettings);
        chai.assert(app.plugins.length === 1);
        chai.assert(app.plugins[0].serviceIdentifier === MyServiceRepositoryPlugin.serviceIdentifier);
    });

});
