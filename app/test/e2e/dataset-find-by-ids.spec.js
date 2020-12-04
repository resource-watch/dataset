const nock = require('nock');
const Dataset = require('models/dataset.model');

const {
    createDataset, deserializeDataset, expectedDataset, ensureCorrectError
} = require('./utils/helpers');
const { getTestServer } = require('./utils/test-server');

const requester = getTestServer();

let cartoFakeDataset;
let jsonFakeDataset;

const BASE_URL = '/api/v1/dataset';

describe('Find by ids datasets', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        await Dataset.deleteMany({}).exec();

        cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        jsonFakeDataset = await new Dataset(createDataset('json')).save();
    });

    it('Return no data if there\'s no such id', async () => {
        const response = await requester
            .post(`${BASE_URL}/find-by-ids`)
            .send({
                ids: ['non-existing-id']
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(0);
    });

    it('Return datasets when getting them by ids', async () => {
        const ids = [cartoFakeDataset.id, jsonFakeDataset.id];
        const response = await requester
            .post(`${BASE_URL}/find-by-ids`).send({ ids });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(2);

        const datasetsIds = deserializeDataset(response).map((_) => _.id);

        datasetsIds.should.contain(cartoFakeDataset.id);
        datasetsIds.should.contain(jsonFakeDataset.id);
    });

    it('Return only existing datasets', async () => {
        const ids = [cartoFakeDataset.id, 'non-existing-id'];
        const response = await requester
            .post(`${BASE_URL}/find-by-ids`).send({ ids });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);

        const dataset = response.body.data[0];

        dataset.should.be.deep.equal(expectedDataset(cartoFakeDataset));
    });

    it('Return 400 error if no data provided at all', async () => {
        const response = await requester
            .post(`${BASE_URL}/find-by-ids`);
        response.status.should.equal(400);
        ensureCorrectError(response.body, '- ids: ids can not be empty. - ');
    });

    it('Return 400 error if data is wrong', async () => {
        const response = await requester
            .post(`${BASE_URL}/find-by-ids`).send({ ids: [{}] });
        response.status.should.equal(400);
        ensureCorrectError(response.body, '- ids: must be a string - ');
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
