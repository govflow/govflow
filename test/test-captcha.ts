import chai from 'chai';
import chaiHttp from 'chai-http';
import { createApp } from '../src/index';

chai.use(chaiHttp);

describe('Try to interact with server with different captcha settings.', function () {

    it('should have captcha enabled', async function () {
        const app = await createApp();
        // even though it is default enabled, we disable it on test runs
        // so enabling again here for this set of tests
        app.config.captchaEnabled = true
        chai.assert.isTrue(app.config.captchaEnabled);
        const res = await chai.request(app).post(`/open311/v2/requests.json`).send({ noCaptchaPayload: 'no captcha'});
        chai.assert.equal(res.status, 400);
        chai.assert.equal(res.body.message, 'Bad request: The reCaptcha token is invalid');
    });

    it('should have captcha disabled', async function () {
        const app = await createApp();
        // captcha is disabled on test runs
        chai.assert.isFalse(app.config.captchaEnabled);
    });

});
