const fs = require('fs');
const nock = require('nock');

const Dataset = require('models/dataset.model');

const { USERS } = require('./utils/test.constants');
const { getTestServer } = require('./utils/test-server');
const { ensureCorrectError, mockGetUserFromToken } = require('./utils/helpers');

let requester;

describe('Upload raw data', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();

        await Dataset.deleteMany({}).exec();
    });

    it('Upload a dataset without being logged in should return a 401 error', async () => {
        const response = await requester
            .post(`/api/v1/dataset/upload`);

        response.status.should.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal(`Unauthorized`);
    });

    it('Upload a dataset without a provider should return a 400 error', async () => {
        mockGetUserFromToken(USERS.USER);

        const response = await requester
            .post(`/api/v1/dataset/upload`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(400);
        ensureCorrectError(response.body, '- no file to check - provider: provider must be in [csv,json,tsv,xml,tif,tiff,geo.tiff]. - ');
    });

    it('Upload a dataset without a valid file should return a 400 error', async () => {
        mockGetUserFromToken(USERS.USER);

        const response = await requester
            .post(`/api/v1/dataset/upload`)
            .set('Authorization', `Bearer abcd`)
            .field('provider', 'csv');

        response.status.should.equal(400);
        ensureCorrectError(response.body, '- dataset: file dataset can not be a empty file. - ');
    });

    it('Return 400 when uploading a large file', async () => {
        mockGetUserFromToken(USERS.USER);

        const filename = 'large_dataset.csv';

        const fileData = fs.readFileSync(`${__dirname}/upload-data/${filename}`);

        const response = await requester
            .post(`/api/v1/dataset/upload`)
            .set('Authorization', `Bearer abcd`)
            .field('provider', 'csv')
            .attach('dataset', fileData, filename);

        response.status.should.equal(400);
        ensureCorrectError(response.body, '- dataset: file too large - ');
    });

    it('Return error if no data provided at all', async () => {
        mockGetUserFromToken(USERS.USER);

        const response = await requester
            .post(`/api/v1/dataset/upload`)
            .set('Authorization', `Bearer abcd`)
            // Needed to force request type
            .field('', '');

        response.status.should.equal(400);
        ensureCorrectError(response.body, '- dataset: file dataset can not be a empty file. - provider: provider must be in [csv,json,tsv,xml,tif,tiff,geo.tiff]. - ');
    });

    it('Return error if provider and file are different', async () => {
        mockGetUserFromToken(USERS.USER);

        const filename = 'dataset_1.json';

        const fileData = fs.readFileSync(`${__dirname}/upload-data/${filename}`);

        const response = await requester
            .post(`/api/v1/dataset/upload`)
            .set('Authorization', `Bearer abcd`)
            .field('provider', 'csv')
            .attach('dataset', fileData, filename);


        response.status.should.equal(400);
        ensureCorrectError(response.body, '- dataset: file dataset_1.json is bad file type. - ');
    });

    it('Uploading a dataset with a binary file should return a 200 (happy case)', async () => {
        mockGetUserFromToken(USERS.USER);

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

        const response = await requester
            .post(`/api/v1/dataset/upload`)
            .set('Authorization', `Bearer abcd`)
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
