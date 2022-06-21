import chai from 'chai';
import { Application } from 'express';
import _ from 'lodash';
import {
    extractPublicIdFromInboundSms, extractServiceRequestfromInboundSms
} from '../src/core/communications/helpers';
import { createApp } from '../src/index';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import { InboundMapAttributes, TestDataPayload } from '../src/types';
import { inboundSms } from './fixtures/inbound';

describe('Parse inbound sms data.', function () {

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

    it('parse a public id from an sms without a public id', async function () {
        const publicId = extractPublicIdFromInboundSms(inboundSms.Body);
        chai.assert.equal(publicId, null);
    });

    it('parse a public id from an sms with a public id', async function () {
        const smsBody = `Request #12987: ${inboundSms.Body}`
        const publicId = extractPublicIdFromInboundSms(`Request #12987: ${smsBody}`);
        chai.assert.equal(publicId, '12987');
    });

    it('parse service request data from an sms without a public id', async function () {
        const { inboundMapRepository } = app.repositories;
        const inboundPayload = _.cloneDeep(inboundSms);
        const sample = _.find(testData.inboundMaps, map => map.channel === 'sms') as InboundMapAttributes;
        inboundPayload.To = sample?.id;
        const [
            { jurisdictionId, departmentId, firstName, lastName, email, phone, description },
            publicId
        ] = await extractServiceRequestfromInboundSms(inboundPayload, inboundMapRepository);
        chai.assert.equal(publicId, null);
        chai.assert(jurisdictionId);
        chai.assert(departmentId);
        chai.assert.equal(phone, inboundPayload.From);
        chai.assert.equal(firstName, '');
        chai.assert.equal(lastName, '');
        chai.assert.equal(email, '');
        chai.assert(description);
    });

    it('parse service request data from an sms with a public id', async function () {
        const { inboundMapRepository } = app.repositories;
        const inboundPayload = _.cloneDeep(inboundSms);
        const sample = _.find(testData.inboundMaps, map => map.channel === 'sms') as InboundMapAttributes;
        inboundPayload.To = sample?.id;
        inboundPayload.Body = `Request #123456: ${inboundPayload.Body}`
        const [
            { jurisdictionId, departmentId, firstName, lastName, email, phone, description },
            publicId
        ] = await extractServiceRequestfromInboundSms(inboundPayload, inboundMapRepository);
        chai.assert.equal(publicId, '123456');
        chai.assert(jurisdictionId);
        chai.assert(departmentId);
        chai.assert.equal(phone, inboundPayload.From);
        chai.assert.equal(firstName, '');
        chai.assert.equal(lastName, '');
        chai.assert.equal(email, '');
        chai.assert(description);
    });

});
