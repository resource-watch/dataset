const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');

chai.should();

const {
    createDataset, deserializeDataset, expectedDataset, ensureCorrectError
} = require('./utils/helpers');
const { getTestServer } = require('./utils/test-server');

let requester;

describe('Find by ids datasets', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    it('Return no data if there\'s no such id', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        const jsonFakeDataset = await new Dataset(createDataset('json')).save();

        const response = await requester
            .post(`/api/v1/dataset/find-by-ids`)
            .send({
                ids: ['non-existing-id']
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(0);
    });

    it('Return datasets when getting them by ids', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        const jsonFakeDataset = await new Dataset(createDataset('json')).save();

        const ids = [cartoFakeDataset.id, jsonFakeDataset.id];
        const response = await requester
            .post(`/api/v1/dataset/find-by-ids`).send({ ids });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(2);

        const datasetsIds = deserializeDataset(response).map((_) => _.id);

        datasetsIds.should.contain(cartoFakeDataset.id);
        datasetsIds.should.contain(jsonFakeDataset.id);
    });

    it('Return only existing datasets', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const ids = [cartoFakeDataset.id, 'non-existing-id'];
        const response = await requester
            .post(`/api/v1/dataset/find-by-ids`).send({ ids });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);

        const dataset = response.body.data[0];

        dataset.should.be.deep.equal(expectedDataset(cartoFakeDataset));
    });

    it('Filters datasets by env=production by default', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        const jsonFakeDataset = await new Dataset(createDataset('json', { env: 'staging' })).save();

        const ids = [cartoFakeDataset.id, jsonFakeDataset.id];
        const response = await requester
            .post(`/api/v1/dataset/find-by-ids`).send({ ids });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(2);

        const datasetsIds = deserializeDataset(response).map((_) => _.id);

        datasetsIds.should.contain(cartoFakeDataset.id);
        datasetsIds.should.contain(jsonFakeDataset.id);
    });

    it('Filters datasets by custom envs - single env value', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        const jsonFakeDataset = await new Dataset(createDataset('json', { env: 'staging' })).save();

        const ids = [cartoFakeDataset.id, jsonFakeDataset.id];
        const response = await requester
            .post(`/api/v1/dataset/find-by-ids`).send({ ids, env: 'staging' });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);

        const datasetsIds = deserializeDataset(response).map((_) => _.id);

        datasetsIds.should.contain(jsonFakeDataset.id);
    });

    it('Filters datasets by custom envs - multiple env value', async () => {
        const datasetOne = await new Dataset(createDataset('cartodb', { env: 'staging' })).save();
        const datasetTwo = await new Dataset(createDataset('json', { env: 'staging' })).save();
        const datasetThree = await new Dataset(createDataset('json')).save();

        const ids = [datasetOne.id, datasetTwo.id, datasetThree.id];
        const response = await requester
            .post(`/api/v1/dataset/find-by-ids`).send({ ids, env: 'staging,potato' });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(2);

        const datasetsIds = deserializeDataset(response).map((_) => _.id);

        datasetsIds.should.contain(datasetOne.id);
        datasetsIds.should.contain(datasetTwo.id);
    });

    it('Return 400 error if no data provided at all', async () => {
        const response = await requester
            .post(`/api/v1/dataset/find-by-ids`);
        response.status.should.equal(400);
        ensureCorrectError(response.body, '- ids: ids can not be empty. - ');
    });

    it('Return 400 error if data is wrong', async () => {
        const response = await requester
            .post(`/api/v1/dataset/find-by-ids`).send({ ids: [{}] });
        response.status.should.equal(400);
        ensureCorrectError(response.body, '- ids: must be a string - ');
    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
