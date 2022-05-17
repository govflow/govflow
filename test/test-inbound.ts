import chai from 'chai';
import { Application } from 'express';
import _ from 'lodash';
import {
    emailBodySanitizeLine,
    extractCreatedAtFromInboundEmail,
    extractDescriptionFromInboundEmail,
    extractForwardDataFromEmail,
    extractForwardedForEmailFromHeaders,
    extractPublicIdFromInboundEmail,
    extractServiceRequestfromInboundEmail
} from '../src/core/communications/helpers';
import { parseRawMail } from '../src/email';
import { createApp } from '../src/index';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import { TestDataPayload } from '../src/types';
import { inboundEmail, rawEmailOne, rawEmailTwo } from './fixtures/inbound';

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

    it('parse a date from an email with a date', async function () {
        const extractedCreatedAt = extractCreatedAtFromInboundEmail(inboundEmail.headers);
        chai.assert.equal(extractedCreatedAt.toUTCString(), 'Tue, 01 Mar 2022 13:31:54 GMT');
    });

    it('parse a date from an email without a date', async function () {
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.headers = '';
        const extractedCreatedAt = extractCreatedAtFromInboundEmail(inboundPayload.headers);
        chai.assert.equal(extractedCreatedAt.toUTCString(), 'Invalid Date');
    });

    it('parse a date from an email with an unparsable date', async function () {
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.headers = 'Date: Hi How Are You';
        const extractedCreatedAt = extractCreatedAtFromInboundEmail(inboundPayload.headers);
        chai.assert.equal(extractedCreatedAt.toUTCString(), 'Invalid Date');
    });

    it('parse an email body text with a thread', async function () {
        const subject = '[Request #123456]: this';
        const baseBody = 'that';
        const body = `${baseBody}${emailBodySanitizeLine} other stuff that we do not want`;
        const text = extractDescriptionFromInboundEmail(subject, body);
        chai.assert.equal(text, `${baseBody}`);
    });

    it('parse an email body text without a thread', async function () {
        const subject = 'this';
        const body = 'that';
        const text = extractDescriptionFromInboundEmail(subject, body);
        chai.assert.equal(text, `${subject}\n\n${body}`);
    });

    it('parse service request data from an email without a public id', async function () {
        const { InboundMap } = app.repositories;
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
        const { InboundMap } = app.repositories;
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

    it('uses email date as creation date', async function () {
        const { InboundMap } = app.repositories;
        const { inboundEmailDomain } = app.config;
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.to = `${testData.inboundMaps[0].id}@${inboundEmailDomain}`;
        const [
            { createdAt }, _publicId
        ] = await extractServiceRequestfromInboundEmail(inboundPayload, inboundEmailDomain, InboundMap);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        chai.assert.equal(createdAt.toUTCString(), 'Tue, 01 Mar 2022 13:31:54 GMT');
    });

    it('cant use email date as creation date', async function () {
        const { InboundMap } = app.repositories;
        const { inboundEmailDomain } = app.config;
        const inboundPayload = _.cloneDeep(inboundEmail);
        inboundPayload.headers = 'Date: Who knows';
        inboundPayload.to = `${testData.inboundMaps[0].id}@${inboundEmailDomain}`;
        const [
            { createdAt }, _publicId
        ] = await extractServiceRequestfromInboundEmail(inboundPayload, inboundEmailDomain, InboundMap);
        chai.assert.equal(createdAt, undefined);
    });

    it('extract forwarded for email from headers with X-Forwarded-For header', async function () {
        const inboundPayload = _.cloneDeep(inboundEmail);
        const headers = inboundPayload.headers + 'X-Forwarded-For: therealssender@example.com\n';
        const sender = extractForwardedForEmailFromHeaders(headers);
        chai.assert.equal(sender, 'therealssender@example.com');
    });

    it('cant extract forwarded for email from headers as none exist', async function () {
        const inboundPayload = _.cloneDeep(inboundEmail);
        const headers = inboundPayload.headers;
        const sender = extractForwardedForEmailFromHeaders(headers);
        chai.assert.equal(sender, null);
    });

    it('can extract correct data from manually forwarded email', async function () {
        const parse1 = await parseRawMail(rawEmailOne);
        const parse2 = await parseRawMail(rawEmailTwo);
        const sample1 = extractForwardDataFromEmail(parse1.text as string, parse1.subject as string);
        const sample2 = extractForwardDataFromEmail(parse2.text as string, parse2.subject as string);

        chai.assert.equal(sample1.forwarded, true);
        chai.assert.equal(sample1.email.from.address, 'actual-submitter@example.com');
        chai.assert.equal(sample1.email.from.name, 'Actual Submitter');
        chai.assert.equal(sample1.email.subject, 'The actual subject line');
        chai.assert.equal(sample1.email.body, 'The actual message');

        chai.assert.equal(sample2.forwarded, true);
        chai.assert.equal(sample2.email.from.address, 'actual-submitter@example.com');
        chai.assert.equal(sample2.email.from.name, 'Actual Submitter');
        chai.assert.equal(sample2.email.subject, 'The actual subject line');
        chai.assert.equal(sample2.email.body, 'The actual message');

    });

    it('extract correct data for forwarded email', async function () {
        const { InboundMap } = app.repositories;
        const { inboundEmailDomain } = app.config;
        const inboundPayload = _.cloneDeep(inboundEmail);
        const parse1 = await parseRawMail(rawEmailOne);
        inboundPayload.subject = _.cloneDeep(parse1.subject as string)
        inboundPayload.text = _.cloneDeep(parse1.text as string)
        inboundPayload.to = `${testData.inboundMaps[0].id}@${inboundEmailDomain}`;
        const [
            { email, firstName, description }, _publicId
        ] = await extractServiceRequestfromInboundEmail(inboundPayload, inboundEmailDomain, InboundMap);
        chai.assert.equal(email, 'actual-submitter@example.com');
        chai.assert.equal(firstName, 'Actual Submitter');
        chai.assert.equal(description, 'The actual subject line\n\nThe actual message');
    });

});
