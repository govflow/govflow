import axios from 'axios';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import { readFile } from 'fs/promises';
import { createApp } from '../src/index';
import makeTestData, { writeTestDataToDatabase } from '../src/tools/fake-data-generator';
import { TestDataPayload } from '../src/types';

chai.use(chaiHttp);

describe('Interact with storage and files', function () {

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

    it('should presign an image upload URL', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const filename = 'test.jpg';
        const { storageEndpoint, storageBucket } = app.config;
        const res = await chai.request(app).post(
            `/storage/presign-put?jurisdictionId=${jurisdictionId}`
        ).send({ filename });
        chai.assert.equal(res.status, 200);
        chai.assert.include(res.body.data.uploadUrl, storageEndpoint);
        chai.assert.include(res.body.data.uploadUrl, storageBucket);
        chai.assert.include(res.body.data.uploadUrl, filename);
        chai.assert.include(res.body.data.uploadUrl, 'X-Amz-Signature');

        // upload the file to the url
        const file = await readFile(`${__dirname}/fixtures/${filename}`);
        await axios.put(res.body.data.uploadUrl, file);
    });

    it('should not be able to access a stored image without credentials', async function () {
        const { storageEndpoint, storageBucket, storagePort } = app.config;
        const filename = 'test.jpg';
        try {
        await axios.get(`http://${storageEndpoint}:${storagePort}/${storageBucket}/${filename}`);
        } catch(error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            chai.assert.equal(error.response.status, 403);
        }
    });

    it('should presign an image get URL', async function () {
        const jurisdictionId = testData.jurisdictions[0].id;
        const filename = 'test.jpg';
        const { storageEndpoint, storageBucket } = app.config;
        const res = await chai.request(app).post(
            `/storage/presign-get?jurisdictionId=${jurisdictionId}`
        ).send({ filename });
        chai.assert.equal(res.status, 200);
        chai.assert.include(res.body.data.retrieveUrl, storageEndpoint);
        chai.assert.include(res.body.data.retrieveUrl, storageBucket);
        chai.assert.include(res.body.data.retrieveUrl, filename);
        chai.assert.include(res.body.data.retrieveUrl, 'X-Amz-Signature');
        // this will fail if not status 200
        await axios.get(res.body.data.retrieveUrl)
    });

});
