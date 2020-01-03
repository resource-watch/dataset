/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { createDataset, deserializeDataset } = require('./utils');

const { getTestServer } = require('./test-server');

const should = chai.should();

const requester = getTestServer();

let cartoFakeDataset;
let jsonFakeDataset;


describe('Sort datasets tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        await Dataset.deleteMany({}).exec();

        cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        jsonFakeDataset = await new Dataset(createDataset('json')).save();
    });

    it('Sort datasets by non-existent field (implicit order)', async () => {
        const responseOne = await requester.get(`/api/v1/dataset?sort=potato`);
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(2);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasetsOne.map(dataset => dataset.id);

        datasetIds.should.contain(jsonFakeDataset._id);
        datasetIds.should.contain(cartoFakeDataset._id);
    });

    it('Sort datasets by provider (implicit order)', async () => {
        const responseOne = await requester.get(`/api/v1/dataset?sort=provider`);
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(2);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map(dataset => dataset.id);

        datasetIdsOne[0].should.equal(cartoFakeDataset._id);
        datasetIdsOne[1].should.equal(jsonFakeDataset._id);
    });

    it('Sort datasets by provider (explicit asc order)', async () => {
        const responseOne = await requester.get(`/api/v1/dataset?sort=+provider`);
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(2);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map(dataset => dataset.id);

        datasetIdsOne[0].should.equal(cartoFakeDataset._id);
        datasetIdsOne[1].should.equal(jsonFakeDataset._id);
    });

    it('Sort datasets by provider (explicit desc order)', async () => {
        const responseOne = await requester.get(`/api/v1/dataset?sort=-provider`);
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(2);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map(dataset => dataset.id);

        datasetIdsOne[0].should.equal(jsonFakeDataset._id);
        datasetIdsOne[1].should.equal(cartoFakeDataset._id);
    });

    it('Sort datasets by relevance with no search criteria should return invalid query error', async () => {
        const responseOne = await requester.get(`/api/v1/dataset?sort=-relevance`);
        const datasetsOne = deserializeDataset(responseOne);

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
