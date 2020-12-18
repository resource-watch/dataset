const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { createDataset, deserializeDataset } = require('./utils/helpers');

const { getTestServer } = require('./utils/test-server');

chai.should();

let requester;

let datasetOne;
let datasetTwo;
let datasetThree;


describe('Sort datasets tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();

        await Dataset.deleteMany({}).exec();

        datasetOne = await new Dataset(createDataset('cartodb')).save();
        datasetTwo = await new Dataset(createDataset('json')).save();
        datasetThree = await new Dataset(createDataset('gee')).save();
    });

    it('Sort datasets by non-existent field (implicit order)', async () => {
        const responseOne = await requester
            .get(`/api/v1/dataset`)
            .query({ sort: 'potato' });

        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(3);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasetsOne.map((dataset) => dataset.id);

        datasetIds.should.contain(datasetTwo._id);
        datasetIds.should.contain(datasetOne._id);
    });

    it('Sort datasets by provider (implicit order)', async () => {
        const responseOne = await requester
            .get(`/api/v1/dataset`)
            .query({ sort: 'provider' });
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(3);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map((dataset) => dataset.id);

        datasetIdsOne[0].should.equal(datasetOne._id);
        datasetIdsOne[1].should.equal(datasetThree._id);
        datasetIdsOne[2].should.equal(datasetTwo._id);
    });

    it('Sort datasets by provider (explicit asc order)', async () => {
        const responseOne = await requester
            .get(`/api/v1/dataset`)
            .query({ sort: '+provider' });

        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(3);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map((dataset) => dataset.id);

        datasetIdsOne[0].should.equal(datasetOne._id);
        datasetIdsOne[1].should.equal(datasetThree._id);
        datasetIdsOne[2].should.equal(datasetTwo._id);
    });

    it('Sort datasets by provider (explicit desc order)', async () => {
        const responseOne = await requester
            .get(`/api/v1/dataset`)
            .query({ sort: '-provider' });

        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(3);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map((dataset) => dataset.id);

        datasetIdsOne[0].should.equal(datasetTwo._id);
        datasetIdsOne[1].should.equal(datasetThree._id);
        datasetIdsOne[2].should.equal(datasetOne._id);
    });

    it('Sort datasets by relevance with no search criteria should return invalid query error', async () => {
        const responseOne = await requester
            .get(`/api/v1/dataset`)
            .query({ sort: '-relevance' });

        deserializeDataset(responseOne);

        responseOne.status.should.equal(400);
        responseOne.body.should.have.property('errors').and.be.an('array');
        responseOne.body.errors[0].should.have.property('detail').and.equal(`Cannot sort by relevance without search criteria`);
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
