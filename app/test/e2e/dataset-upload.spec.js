const fs = require('fs');
const nock = require('nock');

const Dataset = require('models/dataset.model');

const { USERS, ERRORS } = require('./test.constants');
const { getTestServer } = require('./test-server');
const { ensureCorrectError } = require('./utils');

const requester = getTestServer();

const BASE_URL = '/api/v1/dataset';

describe('Upload raw data', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        await Dataset.deleteMany({}).exec();
    });

    it('Return error if no user provided', async () => {
        const filename = 'dataset_1.csv';

        const fileData = fs.readFileSync(`${__dirname}/upload-data/${filename}`);

        const response = await requester.post(`${BASE_URL}/upload`)
            .field('provider', 'csv')
            .attach('dataset', fileData, filename);

        response.status.should.equal(401);
        ensureCorrectError(response.body, 'Unauthorized');
    });

    it('Return 400 when uploading a large file', async () => {
        const filename = 'large_dataset.csv';

        const fileData = fs.readFileSync(`${__dirname}/upload-data/${filename}`);

        const response = await requester.post(`${BASE_URL}/upload`)
            .field('loggedUser', JSON.stringify(USERS.USER))
            .field('provider', 'csv')
            .attach('dataset', fileData, filename);

        response.status.should.equal(400);
        ensureCorrectError(response.body, '- dataset: file too large - ');
    });

    it('Return error if no data provided at all', async () => {
        const response = await requester
            .post(`${BASE_URL}/upload`)
            .field('loggedUser', JSON.stringify(USERS.USER));

        response.status.should.equal(400);
        ensureCorrectError(response.body, ERRORS.UPLOAD_EMPTY_FILE);
    });

    it('Return error if provider and file are different', async () => {
        const filename = 'dataset_1.json';

        const fileData = fs.readFileSync(`${__dirname}/upload-data/${filename}`);

        const response = await requester.post(`${BASE_URL}/upload`)
            .field('loggedUser', JSON.stringify(USERS.USER))
            .field('provider', 'csv')
            .attach('dataset', fileData, filename);


        response.status.should.equal(400);
        ensureCorrectError(response.body, '- dataset: file dataset_1.json is bad file type. - ');
    });

    it('Return 200 when uploading a file', async () => {
        const filename = 'dataset_1.csv';

        const fileData = fs.readFileSync(`${__dirname}/upload-data/${filename}`);

        nock('https://wri-api-backups.s3.amazonaws.com:443')
            .put(() => true)
            .once()
            .reply(200, '', {
                ETag: '"7e3a0db8fad94dd0f51bd9c1b1b239d2"',
                'Content-Length': '0',
                Server: 'AmazonS3'
            });

        const response = await requester.post(`${BASE_URL}/upload`)
            .field('loggedUser', JSON.stringify(USERS.USER))
            .field('provider', 'csv')
            .attach('dataset', fileData, filename);

        const regex = /rw.dataset.raw\/.+_dataset_1.csv/g;

        response.status.should.equal(200);
        response.body.connectorUrl.should.match(regex);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });

    after(async () => {
        await Dataset.deleteMany({}).exec();
    });

});
