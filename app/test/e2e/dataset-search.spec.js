/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { createDataset, deserializeDataset, mapDatasetToMetadataSearchResult } = require('./utils');

const { getTestServer } = require('./test-server');

const should = chai.should();

const requester = getTestServer();

let cartoFakeDataset;
let jsonFakeDataset;


describe('Search datasets tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        nock.cleanAll();

        await Dataset.deleteMany({}).exec();

        cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        jsonFakeDataset = await new Dataset(createDataset('json')).save();
    });

    it('Search for common elements in name and description should return 2 results (no synonyms)', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=fake%20dataset`)
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(cartoFakeDataset),
                    mapDatasetToMetadataSearchResult(jsonFakeDataset)
                ]
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-by-label-synonyms?search=fake%20dataset`)
            .reply(200, {
                data: []
            });

        const response = await requester.get(`/api/v1/dataset?search=fake%20dataset`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(2);
        response.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasets.map(dataset => dataset.id);

        datasetIds.should.contain(jsonFakeDataset._id);
        datasetIds.should.contain(cartoFakeDataset._id);
    });

    it('Search for name of one dataset should return a single result (no synonyms)', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=${encodeURIComponent(cartoFakeDataset.name)}`)
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(cartoFakeDataset),
                ]
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-by-label-synonyms?search=${encodeURIComponent(cartoFakeDataset.name)}`)
            .reply(200, {
                data: []
            });

        const response = await requester.get(`/api/v1/dataset?search=${encodeURIComponent(cartoFakeDataset.name)}`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasets.map(dataset => dataset.id);

        datasetIds.should.contain(cartoFakeDataset._id);
    });

    /**
     * Sort tests
     */
    it('Search with keyword and no explicit sort', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=keyword`)
            .once()
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(cartoFakeDataset),
                    mapDatasetToMetadataSearchResult(jsonFakeDataset),
                ]
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-by-label-synonyms?search=keyword`)
            .once()
            .reply(200, {
                data: []
            });

        const responseOne = await requester.get(`/api/v1/dataset?search=keyword`);
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(2);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map(dataset => dataset.id);

        datasetIdsOne.should.contain(cartoFakeDataset._id);
        datasetIdsOne.should.contain(jsonFakeDataset._id);
    });

    it('Search with keyword and sort by most viewed is sorted using the graph', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=keyword`)
            .twice()
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(cartoFakeDataset),
                    mapDatasetToMetadataSearchResult(jsonFakeDataset),
                ]
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-by-label-synonyms?search=keyword&sort=-most-viewed`)
            .twice()
            .reply(200, {
                data: []
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-datasets-ids?search=keyword&sort=-most-viewed`)
            .once()
            .reply(200, {
                data: [
                    jsonFakeDataset._id,
                    cartoFakeDataset._id
                ]
            });

        const responseOne = await requester.get(`/api/v1/dataset?search=keyword&sort=-most-viewed`);
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(2);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map(dataset => dataset.id);

        datasetIdsOne[0].should.equal(jsonFakeDataset._id);
        datasetIdsOne[1].should.equal(cartoFakeDataset._id);


        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-datasets-ids?search=keyword&sort=-most-viewed`)
            .once()
            .reply(200, {
                data: [
                    cartoFakeDataset._id,
                    jsonFakeDataset._id
                ]
            });

        const responseTwo = await requester.get(`/api/v1/dataset?search=keyword&sort=-most-viewed`);
        const datasetsTwo = deserializeDataset(responseTwo);

        responseTwo.status.should.equal(200);
        responseTwo.body.should.have.property('data').with.lengthOf(2);
        responseTwo.body.should.have.property('links').and.be.an('object');

        const datasetIdsTwo = datasetsTwo.map(dataset => dataset.id);

        datasetIdsTwo[0].should.equal(cartoFakeDataset._id);
        datasetIdsTwo[1].should.equal(jsonFakeDataset._id);
    });

    it('Search with keyword and sort by most favorited is sorted using the graph', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=keyword`)
            .twice()
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(cartoFakeDataset),
                    mapDatasetToMetadataSearchResult(jsonFakeDataset),
                ]
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-by-label-synonyms?search=keyword&sort=-most-favorited`)
            .twice()
            .reply(200, {
                data: []
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-datasets-ids?search=keyword&sort=-most-favorited`)
            .once()
            .reply(200, {
                data: [
                    jsonFakeDataset._id,
                    cartoFakeDataset._id
                ]
            });

        const responseOne = await requester.get(`/api/v1/dataset?search=keyword&sort=-most-favorited`);
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(2);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map(dataset => dataset.id);

        datasetIdsOne[0].should.equal(jsonFakeDataset._id);
        datasetIdsOne[1].should.equal(cartoFakeDataset._id);


        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-datasets-ids?search=keyword&sort=-most-favorited`)
            .once()
            .reply(200, {
                data: [
                    cartoFakeDataset._id,
                    jsonFakeDataset._id
                ]
            });

        const responseTwo = await requester.get(`/api/v1/dataset?search=keyword&sort=-most-favorited`);
        const datasetsTwo = deserializeDataset(responseTwo);

        responseTwo.status.should.equal(200);
        responseTwo.body.should.have.property('data').with.lengthOf(2);
        responseTwo.body.should.have.property('links').and.be.an('object');

        const datasetIdsTwo = datasetsTwo.map(dataset => dataset.id);

        datasetIdsTwo[0].should.equal(cartoFakeDataset._id);
        datasetIdsTwo[1].should.equal(jsonFakeDataset._id);
    });

    it('Search with keyword and sort by relevance non-specified is sorted using metadata', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=keyword&sort=relevance`)
            .once()
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(cartoFakeDataset),
                    mapDatasetToMetadataSearchResult(jsonFakeDataset),
                ]
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-by-label-synonyms?search=keyword&sort=relevance`)
            .once()
            .reply(200, {
                data: []
            });


        const response = await requester.get(`/api/v1/dataset?search=keyword&sort=relevance`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(2);
        response.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasets.map(dataset => dataset.id);

        datasetIds[0].should.equal(cartoFakeDataset._id);
        datasetIds[1].should.equal(jsonFakeDataset._id);
    });

    it('Search with keyword and sort by relevance descending is sorted using metadata', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=keyword&sort=-relevance`)
            .once()
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(cartoFakeDataset),
                    mapDatasetToMetadataSearchResult(jsonFakeDataset),
                ]
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-by-label-synonyms?search=keyword&sort=-relevance`)
            .once()
            .reply(200, {
                data: []
            });


        const response = await requester.get(`/api/v1/dataset?search=keyword&sort=${encodeURIComponent('-')}relevance`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(2);
        response.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasets.map(dataset => dataset.id);

        datasetIds[0].should.equal(cartoFakeDataset._id);
        datasetIds[1].should.equal(jsonFakeDataset._id);
    });


    it('Search with keyword and sort by relevance ascending return an error for invalid request', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=keyword&sort=+relevance`)
            .once()
            .reply(400, {
                errors: [
                    {
                        status: 400,
                        detail: 'Sort by relevance ascending not supported'
                    }
                ]
            });

        const response = await requester.get(`/api/v1/dataset?search=keyword&sort=${encodeURIComponent('+')}relevance`);

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`400 - {"errors":[{"status":400,"detail":"Sort by relevance ascending not supported"}]}`);
    });

    it('Search with keyword and sort by other keyword is sorted using the metadata', async () => {
        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=keyword&sort=metadata`)
            .once()
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(cartoFakeDataset),
                    mapDatasetToMetadataSearchResult(jsonFakeDataset),
                ]
            });

        nock(`${process.env.CT_URL}`)
            .get(`/v1/graph/query/search-by-label-synonyms?search=keyword&sort=metadata`)
            .twice()
            .reply(200, {
                data: []
            });

        const responseOne = await requester.get(`/api/v1/dataset?search=keyword&sort=metadata`);
        const datasetsOne = deserializeDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').with.lengthOf(2);
        responseOne.body.should.have.property('links').and.be.an('object');

        const datasetIdsOne = datasetsOne.map(dataset => dataset.id);

        datasetIdsOne[0].should.equal(cartoFakeDataset._id);
        datasetIdsOne[1].should.equal(jsonFakeDataset._id);

        nock(`${process.env.CT_URL}`)
            .get(`/v1/metadata?search=keyword&sort=metadata`)
            .once()
            .reply(200, {
                data: [
                    mapDatasetToMetadataSearchResult(jsonFakeDataset),
                    mapDatasetToMetadataSearchResult(cartoFakeDataset)
                ]
            });

        const responseTwo = await requester.get(`/api/v1/dataset?search=keyword&sort=metadata`);
        const datasetsTwo = deserializeDataset(responseTwo);

        responseTwo.status.should.equal(200);
        responseTwo.body.should.have.property('data').with.lengthOf(2);
        responseTwo.body.should.have.property('links').and.be.an('object');

        const datasetIdsTwo = datasetsTwo.map(dataset => dataset.id);

        datasetIdsTwo[0].should.equal(jsonFakeDataset._id);
        datasetIdsTwo[1].should.equal(cartoFakeDataset._id);
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
