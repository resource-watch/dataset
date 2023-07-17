const nock = require('nock');
const chai = require('chai');
const config = require('config');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const { createDataset, deserializeDataset } = require('./utils/helpers');

const { getTestServer } = require('./utils/test-server');
const { getUUID, expectedDataset } = require('./utils/helpers');
const { mockValidateRequestWithApiKey } = require('./utils/mocks');

chai.should();

let requester;

describe('Get dataset by id', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    it('Get an existing dataset by ID should be successful', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        mockValidateRequestWithApiKey({});

        const response = await requester
            .get(`/api/v1/dataset/${cartoFakeDataset._id}`)
            .set('x-api-key', 'api-key-test');
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        dataset.should.have.property('name').and.equal(cartoFakeDataset.name);
        response.body.data.should.deep.equal(expectedDataset(cartoFakeDataset));
    });

    it('Get an non-existing dataset by ID should fail', async () => {
        const uuid = getUUID();
        mockValidateRequestWithApiKey({});

        const response = await requester
            .get(`/api/v1/dataset/${uuid}`)
            .set('x-api-key', 'api-key-test');

        response.status.should.equal(404);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Dataset with id '${uuid}' doesn't exist`);
    });

    it('Get an existing dataset by ID should be successful - With `sources` field', async () => {
        await new Dataset(createDataset('cartodb')).save();
        await new Dataset(createDataset('json')).save();
        const csvFakeDataset = await new Dataset(createDataset('csv')).save();
        mockValidateRequestWithApiKey({});

        const response = await requester
            .get(`/api/v1/dataset/${csvFakeDataset._id}`)
            .set('x-api-key', 'api-key-test');
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        dataset.should.have.property('name').and.equal(csvFakeDataset.name);
        dataset.should.have.property('sources').and.eql(csvFakeDataset.sources);
        dataset.should.have.property('connectorUrl').and.equal(csvFakeDataset.connectorUrl);
    });

    afterEach(async () => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }

        await Dataset.deleteMany({}).exec();
    });
});
