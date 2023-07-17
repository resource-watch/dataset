const nock = require('nock');
const Dataset = require('models/dataset.model');

const { USERS } = require('./utils/test.constants');
const { createDataset, ensureCorrectError } = require('./utils/helpers');
const { getTestServer } = require('./utils/test-server');
const { mockValidateRequestWithApiKey, mockValidateRequestWithApiKeyAndUserToken } = require('./utils/mocks');

let requester;

let jsonFakeDataset;

describe('Upload raw data', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();

        await Dataset.deleteMany({}).exec();

        jsonFakeDataset = await new Dataset(createDataset('json')).save();
    });

    it('Return 401 error if no user provided', async () => {
        mockValidateRequestWithApiKey({});

        const response = await requester
            .post(`/api/v1/dataset/${jsonFakeDataset.id}/recover`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(401);
        ensureCorrectError(response.body, 'Unauthorized');
    });

    it('Return 401 error if role is USER', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.USER });

        const response = await requester
            .post(`/api/v1/dataset/${jsonFakeDataset.id}/recover`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test')
        ;

        response.status.should.equal(401);
        ensureCorrectError(response.body, 'Unauthorized');
    });

    it('Return 401 error if role is MANAGER', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MANAGER });

        const response = await requester
            .post(`/api/v1/dataset/${jsonFakeDataset.id}/recover`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test')
        ;

        response.status.should.equal(401);
        ensureCorrectError(response.body, 'Unauthorized');
    });

    it('Return 404 error if the dataset doesn\'t exist', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

        const response = await requester
            .post(`/api/v1/dataset/fake-id/recover`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test')
        ;

        response.status.should.equal(404);
        ensureCorrectError(response.body, 'Dataset with id \'fake-id\' doesn\'t exist');
    });

    it('Successfully recover a dataset', async () => {
        mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

        const response = await requester
            .post(`/api/v1/dataset/${jsonFakeDataset.id}/recover`)
            .set('Authorization', `Bearer abcd`)
            .set('x-api-key', 'api-key-test')
        ;

        response.status.should.equal(200);
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
