import chai from 'chai';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';

describe('Try different configuration settings.', () => {

    it('should create an app with overriden existing configuration', async () => {
        const appSettings = {
            config: [
                {
                    key: 'database_url',
                    value: 'postgres://me@localhost:5432/govflow'
                },
                {
                    key: 'app_port',
                    value: 9000
                }
            ]
        }
        let app = await createApp(appSettings as AppSettings);
        chai.assert(app);
        chai.assert.equal(app.config.get('app_port'), 9000);
        chai.assert.equal(app.config.get('database_url'), 'postgres://me@localhost:5432/govflow');
    });

    it('should create an app with new custom configuration', async () => {
        const appSettings = {
            config: [
                {
                    key: 'mykey',
                    value: 'myvalue'
                }
            ]
        }
        let app = await createApp(appSettings as AppSettings);
        chai.assert(app);
        chai.assert.equal(app.config.get('mykey'), 'myvalue');
    });

});
