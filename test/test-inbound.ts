import chai from 'chai';
import _ from 'lodash';
import { extractPublicIdFromInboundEmail, extractServiceRequestfromInboundEmail } from '../src/core/communications/helpers';
import { inboundEmail } from './fixtures/inbound';

describe('Parse inbound email data.', function () {

    it('parse a public id from an email without a public id', async function () {
        const publicId = extractPublicIdFromInboundEmail(inboundEmail.subject);
        chai.assert.equal(publicId, null);
    });

    it('parse a public id from an email with a public id', async function () {
        const publicId = extractPublicIdFromInboundEmail(`Request #12987: ${inboundEmail.subject}`);
        chai.assert.equal(publicId, '12987');
    });

    it('parse service request data from an email without a public id', async function () {
        const [
            { jurisdictionId, departmentId, firstName, lastName, email, description },
            publicId
        ] = extractServiceRequestfromInboundEmail(inboundEmail, 'inbound.example.com');
        chai.assert.equal(publicId, null);
        chai.assert(jurisdictionId);
        chai.assert(departmentId);
        chai.assert.equal(firstName, 'Jo Bloggs');
        chai.assert.equal(lastName, '');
        chai.assert.equal(email, 'jo.bloggs@example.com');
        chai.assert(description);
    });

    it('parse service request data from an email with a public id', async function () {
        const inbound = _.cloneDeep(inboundEmail);
        inbound.subject = `Request #123456: ${inbound.subject}`
        const [
            { jurisdictionId, departmentId, firstName, lastName, email, description },
            publicId
        ] = extractServiceRequestfromInboundEmail(inbound, 'inbound.example.com');
        chai.assert.equal(publicId, '123456');
        chai.assert(jurisdictionId);
        chai.assert(departmentId);
        chai.assert.equal(firstName, 'Jo Bloggs');
        chai.assert.equal(lastName, '');
        chai.assert.equal(email, 'jo.bloggs@example.com');
        chai.assert(description);
    });

});
