const nock = require('nock');
const Dataset = require('models/dataset.model');

const { USERS } = require('./utils/test.constants');
const { createDataset, ensureCorrectError, mockGetUserFromToken } = require('./utils/helpers');
const { getTestServer } = require('./utils/test-server');

const requester = getTestServer();

let jsonFakeDataset;

describe('Upload raw data', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        await Dataset.deleteMany({}).exec();

        jsonFakeDataset = await new Dataset(createDataset('json')).save();
    });

    it('Return 401 error if no user provided', async () => {
        const response = await requester
            .post(`/api/v1/dataset/${jsonFakeDataset.id}/recover`);

        response.status.should.equal(401);
        ensureCorrectError(response.body, 'Unauthorized');
    });

    it('Return 401 error if role is USER', async () => {
        mockGetUserFromToken(USERS.USER);

        const response = await requester
            .post(`/api/v1/dataset/${jsonFakeDataset.id}/recover`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(401);
        ensureCorrectError(response.body, 'Unauthorized');
    });

    it('Return 401 error if role is MANAGER', async () => {
        mockGetUserFromToken(USERS.MANAGER);

        const response = await requester
            .post(`/api/v1/dataset/${jsonFakeDataset.id}/recover`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(401);
        ensureCorrectError(response.body, 'Unauthorized');
    });

    it('Return 404 error if the dataset doesn\'t exist', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const response = await requester
            .post(`/api/v1/dataset/fake-id/recover`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(404);
        ensureCorrectError(response.body, 'Dataset with id \'fake-id\' doesn\'t exist');
    });

    it('Successfully recover a dataset', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const response = await requester
            .post(`/api/v1/dataset/${jsonFakeDataset.id}/recover`)
            .set('Authorization', `Bearer abcd`);

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
