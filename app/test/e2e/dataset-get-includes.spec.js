/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const fs = require('fs');
const path = require('path');
const { createDataset, deserializeDataset } = require('./utils');

const metadataGetWithSearchForHuman = require('./dataset-get-includes-responses/metadata-get-search-human');
const widgetsFindById = require('./dataset-get-includes-responses/widget-find-by-ids');
const metadataFindById = require('./dataset-get-includes-responses/metadata-find-by-ids');
const vocabularyFindById = require('./dataset-get-includes-responses/vocabulary-find-by-ids');
const layersFindById = require('./dataset-get-includes-responses/layer-find-by-ids');
const graphFindById = require('./dataset-get-includes-responses/graph-find-by-ids');
const datasetGetIncludeAllAnonymous = require('./dataset-get-includes-responses/dataset-get-include-all-anonymous');
const datasetGetIncludeAllAdmin = require('./dataset-get-includes-responses/dataset-get-include-all-admin');
const { getTestServer } = require('./test-server');
const { getUUID } = require('./utils');
const { USERS } = require('./test.constants');

const should = chai.should();

const requester = getTestServer();

let cartoFakeDataset;


describe('Get datasets with includes tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        nock.cleanAll();

        Dataset.remove({}).exec();

        cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
    });


    it('Get datasets with includes should return requested data except users (anonymous request)', async () => {

        const datasetIds = [cartoFakeDataset.id];

        nock(process.env.CT_URL)
            .get('/v1/metadata')
            .query({ search: 'human' })
            .reply(200, metadataGetWithSearchForHuman(cartoFakeDataset));

        nock(process.env.CT_URL)
            .get('/v1/graph/query/search-by-label-synonyms')
            .query({
                application: 'rw',
                env: 'production',
                includes: 'layer,metadata,vocabulary,widget,graph,user',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [cartoFakeDataset.id] });


        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: [USERS.ADMIN.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [] });


        nock(process.env.CT_URL)
            .post('/v1/widget/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, widgetsFindById(cartoFakeDataset));


        nock(process.env.CT_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [cartoFakeDataset.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, vocabularyFindById());


        nock(process.env.CT_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [cartoFakeDataset.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, metadataFindById(cartoFakeDataset));

        nock(process.env.CT_URL)
            .post('/v1/layer/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, layersFindById(cartoFakeDataset));

        nock(process.env.CT_URL)
            .post('/v1/graph/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, graphFindById(cartoFakeDataset));


        const response = await requester.get(`/api/v1/dataset?application=rw&env=production&includes=layer,metadata,vocabulary,widget,graph,user&language=en&page[number]=1&page[size]=12&published=true&search=human&page[size]=12&page[number]=1`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal(datasetGetIncludeAllAnonymous(cartoFakeDataset));
    });

    it('Get datasets with includes should return requested data including users (ADMIN user request)', async () => {

        const datasetIds = [cartoFakeDataset.id];

        nock(process.env.CT_URL)
            .get('/v1/metadata')
            .query({ search: 'human' })
            .reply(200, metadataFindById(cartoFakeDataset));

        nock(process.env.CT_URL)
            .get('/v1/graph/query/search-by-label-synonyms')
            .query({
                application: 'rw',
                env: 'production',
                includes: 'layer,metadata,vocabulary,widget,graph,user',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [cartoFakeDataset.id] });

        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: [USERS.ADMIN.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    ...USERS.ADMIN,
                    _id: USERS.ADMIN.id
                }]
            });

        nock(process.env.CT_URL)
            .post('/v1/widget/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, widgetsFindById(cartoFakeDataset));


        nock(process.env.CT_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [cartoFakeDataset.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, vocabularyFindById(cartoFakeDataset));


        nock(process.env.CT_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [cartoFakeDataset.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, metadataFindById(cartoFakeDataset));

        nock(process.env.CT_URL)
            .post('/v1/layer/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, layersFindById(cartoFakeDataset));

        nock(process.env.CT_URL)
            .post('/v1/graph/find-by-ids', { ids: [cartoFakeDataset.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, graphFindById(cartoFakeDataset));


        const response = await requester.get(`/api/v1/dataset?application=rw&env=production&includes=layer,metadata,vocabulary,widget,graph,user&language=en&page[number]=1&page[size]=12&published=true&search=human&page[size]=12&page[number]=1&loggedUser=${JSON.stringify(USERS.ADMIN)}`);

        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal(datasetGetIncludeAllAdmin(cartoFakeDataset));
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });

    after(() => {
        Dataset.remove({}).exec();
    });
});
