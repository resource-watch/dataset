const nock = require('nock');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const { createDataset, ensureCorrectError, mockGetUserFromToken } = require('./utils/helpers');
const { getTestServer } = require('./utils/test-server');

let requester;

describe('Upload raw data', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    it('Return 401 error if no user provided', async () => {
        const fakeDataset = await new Dataset(createDataset('json')).save();

        const response = await requester
            .post(`/api/v1/dataset/${fakeDataset.id}/flush`);

        response.status.should.equal(401);
        ensureCorrectError(response.body, 'Unauthorized');
    });

    it('Return 403 error if role USER tries to flush a dataset', async () => {
        mockGetUserFromToken(USERS.USER);

        const fakeDataset = await new Dataset(createDataset('json')).save();

        const response = await requester
            .post(`/api/v1/dataset/${fakeDataset.id}/flush`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(403);
        ensureCorrectError(response.body, 'Forbidden');
    });

    it('Return 403 error if the dataset doesn\'t exit', async () => {
        mockGetUserFromToken(USERS.USER);

        const fakeDataset = await new Dataset(createDataset('json')).save();

        const response = await requester
            .post(`/api/v1/dataset/${fakeDataset.id}/flush`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(403);
        ensureCorrectError(response.body, 'Forbidden');
    });

    it('Flush a dataset as a USER that the requesting user owns should fail', async () => {
        mockGetUserFromToken(USERS.USER);

        const fakeDataset = await new Dataset(createDataset('json', { userId: USERS.USER.id })).save();

        const response = await requester
            .post(`/api/v1/dataset/${fakeDataset.id}/flush`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(403);
    });

    it('Successfully flush a dataset as a MANAGER that the requesting user owns', async () => {
        mockGetUserFromToken(USERS.MANAGER);

        const fakeDataset = await new Dataset(createDataset('json', { userId: USERS.MANAGER.id })).save();

        const response = await requester
            .post(`/api/v1/dataset/${fakeDataset.id}/flush`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(200);
    });

    it('Flush a dataset as a MANAGER that the requesting user does not own should fail', async () => {
        mockGetUserFromToken(USERS.MANAGER);

        const fakeDataset = await new Dataset(createDataset('json', { userId: USERS.USER.id })).save();

        const response = await requester
            .post(`/api/v1/dataset/${fakeDataset.id}/flush`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });

    it('Successfully flush a dataset as an ADMIN', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const fakeDataset = await new Dataset(createDataset('json')).save();

        const response = await requester
            .post(`/api/v1/dataset/${fakeDataset.id}/flush`)
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(200);
    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
