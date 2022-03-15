import chai from 'chai';
import { Application } from 'express';
import _ from 'lodash';
import { extractPublicIdFromInboundEmail, extractServiceRequestfromInboundEmail } from '../src/core/communications/helpers';
import { createApp } from '../src/index';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import { TestDataPayload } from '../src/types';
import { inboundEmail } from './fixtures/inbound';

describe('Parse inbound email data.', function () {

    let app: Application;
    let testData: TestDataPayload;

    before(async function () {
        app = await createApp();
        await app.migrator.up();
        testData = makeTestData();
        await writeTestDataToDatabase(app.database, testData);
    })

    after(async function () {
        await app.database.drop({});
    })

    it('parse a public id from an email without a public id', async function () {
        const publicId = extractPublicIdFromInboundEmail(inboundEmail.subject);
        chai.assert.equal(publicId, null);
    });

    it('parse a public id from an email with a public id', async function () {
        const publicId = extractPublicIdFromInboundEmail(`Request #12987: ${inboundEmail.subject}`);
        chai.assert.equal(publicId, '12987');
    });

    it('parse service request data from an email without a public id', async function () {
        const { InboundMap } = app.database.models;
        const { inboundEmailDomain } = app.config;
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.to = `${testData.inboundMaps[0].id}@${inboundEmailDomain}`;
        const [
            { jurisdictionId, departmentId, firstName, lastName, email, description },
            publicId
        ] = await extractServiceRequestfromInboundEmail(inboundPayload, inboundEmailDomain, InboundMap);
        chai.assert.equal(publicId, null);
        chai.assert(jurisdictionId);
        chai.assert(departmentId);
        chai.assert.equal(firstName, 'Jo Bloggs');
        chai.assert.equal(lastName, '');
        chai.assert.equal(email, 'jo.bloggs@example.com');
        chai.assert(description);
    });

    it('parse service request data from an email with a public id', async function () {
        const { InboundMap } = app.database.models;
        const { inboundEmailDomain } = app.config;
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.to = `${testData.inboundMaps[0].id}@${inboundEmailDomain}`;
        inboundPayload.subject = `Request #123456: ${inboundPayload.subject}`
        const [
            { jurisdictionId, departmentId, firstName, lastName, email, description },
            publicId
        ] = await extractServiceRequestfromInboundEmail(inboundPayload, inboundEmailDomain, InboundMap);
        chai.assert.equal(publicId, '123456');
        chai.assert(jurisdictionId);
        chai.assert(departmentId);
        chai.assert.equal(firstName, 'Jo Bloggs');
        chai.assert.equal(lastName, '');
        chai.assert.equal(email, 'jo.bloggs@example.com');
        chai.assert(description);
    });

});
