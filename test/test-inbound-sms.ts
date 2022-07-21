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

    it('runs disambiguation flow for new service request', async function () {
        const { inboundMessageService } = app.services;
        const inboundPayload = _.cloneDeep(inboundSms);
        const sample = _.find(testData.inboundMaps, map => map.channel === 'sms') as InboundMapAttributes;
        inboundPayload.To = sample?.id;
        const [disambiguate, disambiguateMessage] = await inboundMessageService.disambiguateInboundData(
            inboundPayload
        );
        const [record, _created] = await inboundMessageService.createServiceRequest(inboundPayload);
        chai.assert.equal(disambiguate, false);
        chai.assert.equal(disambiguateMessage, '');

        const inboundPayload2 = _.cloneDeep(inboundPayload);
        inboundPayload2.To = sample?.id;
        inboundPayload2.Body = 'the original message that needs disambiguation';
        const [disambiguate2, disambiguateMessage2] = await inboundMessageService.disambiguateInboundData(
            inboundPayload2
        );
        chai.assert.equal(disambiguate2, true);
        chai.assert.equal(disambiguateMessage2.includes(record.publicId), true);

        const inboundPayload3 = _.cloneDeep(inboundPayload);
        inboundPayload3.To = sample?.id;
        inboundPayload3.Body = 'butterflies'; // invalid disambiguation response
        const [disambiguate3, disambiguateMessage3] = await inboundMessageService.disambiguateInboundData(
            inboundPayload3
        );
        chai.assert.equal(disambiguate3, true);
        chai.assert.equal(disambiguateMessage3.includes('Your response was invalid'), true);

        const inboundPayload4 = _.cloneDeep(inboundPayload);
        inboundPayload4.To = sample?.id;
        inboundPayload4.Body = '1'; // valid response to create a new service request
        const [
            disambiguate4,
            disambiguateMessage4,
            disambiguatedOriginalMessage,
            disambiguatedPublicId
        ] = await inboundMessageService.disambiguateInboundData(inboundPayload4);
        const [record4, _created4] = await inboundMessageService.createServiceRequest(
            inboundPayload, disambiguatedOriginalMessage, disambiguatedPublicId
        );
        chai.assert.equal(disambiguate4, false);
        chai.assert.equal(disambiguateMessage4, '');
        chai.assert.equal(record4.description, inboundPayload2.Body);
    });

    it('runs disambiguation flow for comment on existing service request', async function () {
        const { inboundMessageService } = app.services;
        const inboundPayload = _.cloneDeep(inboundSms);
        const sample = _.find(testData.inboundMaps, map => map.channel === 'sms') as InboundMapAttributes;
        inboundPayload.To = sample?.id;
        inboundPayload.Body = 'My comment on an existing request';
        const [disambiguate] = await inboundMessageService.disambiguateInboundData(
            inboundPayload
        );
        chai.assert.equal(disambiguate, true);

        const inboundPayload2 = _.cloneDeep(inboundPayload);
        inboundPayload2.To = sample?.id;
        inboundPayload2.Body = '2'; // valid response to create a comment on an existing service request
        const [
            disambiguate2,
            disambiguateMessage2,
            disambiguatedOriginalMessage,
            disambiguatedPublicId
        ] = await inboundMessageService.disambiguateInboundData(inboundPayload2);
        const [record2, _created2] = await inboundMessageService.createServiceRequest(
            inboundPayload, disambiguatedOriginalMessage, disambiguatedPublicId
        );
        chai.assert.equal(disambiguate2, false);
        chai.assert.equal(disambiguateMessage2, '');
        chai.assert.equal(record2.publicId, disambiguatedPublicId);
        chai.assert.notEqual(record2.description, disambiguatedOriginalMessage);
    });

});
