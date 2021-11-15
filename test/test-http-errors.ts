import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyBrokenServiceRepositoryPlugin } from './fixtures/repositories';

chai.use(chaiHttp);

describe('Check responses in common error scenarios', function () {
    let app: Application;

    before(async function () {
        const appSettings = { plugins: [MyBrokenServiceRepositoryPlugin] };
        app = await createApp(appSettings as AppSettings);
    })

    it('should return 404 not found for routes that do not exist', async function () {
        try {
            const res = await chai.request(app).get('/this-route-does-not-exist')
            chai.assert.equal(res.status, 404);
        } catch (error) {
            throw error;
        }
    });

    it('should return 500 internal server error', async function () {
        try {
            const res = await chai.request(app).get('/services/not-a-real-jurisdiction-id')
            chai.assert.equal(res.status, 500);
        } catch (error) {
            throw error;
        }
    });

});
