import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import { createApp } from '../src/index';
import type { AppSettings } from '../src/types';
import { MyBrokenJurisdictionRepositoryPlugin } from './fixtures/repositories';

chai.use(chaiHttp);

describe('Check responses in common error scenarios', function () {
    let app: Application;

    before(async function () {
        const appSettings = { plugins: [MyBrokenJurisdictionRepositoryPlugin] };
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
            const res = await chai.request(app).get('/jurisdictions/not-a-real-jurisdiction-id')
            chai.assert.equal(res.status, 500);
        } catch (error) {
            throw error;
        }
    });

    it('should return 403 error when no jurisdictionId query param', async function () {
        try {
            const res = await chai.request(app).get('/services')
            chai.assert.equal(res.status, 403);
        } catch (error) {
            throw error;
        }
    });

    it('should return 403 error when no jurisdiction_id query param', async function () {
        try {
            const res = await chai.request(app).get('/open311/services.json')
            chai.assert.equal(res.status, 403);
        } catch (error) {
            throw error;
        }
    });

    it('should return 501 (not 403) error for a route exluded from required jurisdiction_id query param', async function () {
        try {
            const res = await chai.request(app).get('/open311/discovery')
            chai.assert.equal(res.status, 501);
        } catch (error) {
            throw error;
        }
    });

});
