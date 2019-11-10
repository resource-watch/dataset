/* eslint-disable no-unused-vars,no-undef,max-len */
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
const datasetGetIncludeUserAdmin = require('./dataset-get-includes-responses/dataset-get-include-user-admin');
const datasetGetIncludeAllAdmin = require('./dataset-get-includes-responses/dataset-get-include-all-admin');
const { getTestServer } = require('./test-server');
const { getUUID } = require('./utils');
const { USERS } = require('./test.constants');

const should = chai.should();

const requester = getTestServer();

describe('Get datasets with includes tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        nock.cleanAll();

        await Dataset.remove({}).exec();
    });


    it('Get datasets with includes should return requested data except users (anonymous request)', async () => {
        const fakeDatasetOne = await new Dataset(createDataset('cartodb')).save();

        const datasetIds = [fakeDatasetOne.id];

        nock(process.env.CT_URL)
            .get('/v1/metadata')
            .query({ search: 'human' })
            .reply(200, metadataGetWithSearchForHuman(fakeDatasetOne));

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
            .reply(200, { data: [fakeDatasetOne.id] });


        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
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
            .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, widgetsFindById(fakeDatasetOne));


        nock(process.env.CT_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
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
            .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, metadataFindById(fakeDatasetOne));

        nock(process.env.CT_URL)
            .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, layersFindById(fakeDatasetOne));

        nock(process.env.CT_URL)
            .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, graphFindById(fakeDatasetOne));


        const response = await requester.get(`/api/v1/dataset?application=rw&env=production&includes=layer,metadata,vocabulary,widget,graph,user&language=en&page[number]=1&page[size]=12&published=true&search=human&page[size]=12&page[number]=1`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal(datasetGetIncludeAllAnonymous(fakeDatasetOne));
    });

    it('Get datasets with includes should return requested data including users (ADMIN user request)', async () => {
        const fakeDatasetOne = await new Dataset(createDataset('cartodb')).save();

        const datasetIds = [fakeDatasetOne.id];

        nock(process.env.CT_URL)
            .get('/v1/metadata')
            .query({ search: 'human' })
            .reply(200, metadataFindById(fakeDatasetOne));

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
            .reply(200, { data: [fakeDatasetOne.id] });

        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
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
                    _id: fakeDatasetOne.userId
                }]
            });

        nock(process.env.CT_URL)
            .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, widgetsFindById(fakeDatasetOne));


        nock(process.env.CT_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, vocabularyFindById(fakeDatasetOne));


        nock(process.env.CT_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, metadataFindById(fakeDatasetOne));

        nock(process.env.CT_URL)
            .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, layersFindById(fakeDatasetOne));

        nock(process.env.CT_URL)
            .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                env: 'production',
                language: 'en',
                page: { number: '1,1', size: '12,12' },
                published: true,
                search: 'human'
            })
            .reply(200, graphFindById(fakeDatasetOne));


        const response = await requester.get(`/api/v1/dataset?application=rw&env=production&includes=layer,metadata,vocabulary,widget,graph,user&language=en&page[number]=1&page[size]=12&published=true&search=human&page[size]=12&page[number]=1&loggedUser=${JSON.stringify(USERS.ADMIN)}`);

        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal(datasetGetIncludeAllAdmin(fakeDatasetOne));
    });

    it('Get datasets with includes user should return a list of datasets and user name, email and role, even if only partial data exists', async () => {
        const fakeDatasetOne = await new Dataset(createDataset('cartodb')).save();
        const fakeDatasetTwo = await new Dataset(createDataset('cartodb')).save();
        const fakeDatasetThree = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.CT_URL)
            .post(`/auth/user/find-by-ids`, {
                ids: [fakeDatasetOne.userId, fakeDatasetTwo.userId, fakeDatasetThree.userId]
            })
            .reply(200, {
                data: [{
                    _id: fakeDatasetOne.userId,
                    provider: 'local',
                    name: 'test user',
                    email: 'user-one@control-tower.org',
                    role: 'USER',
                    extraUserData: {
                        apps: [
                            'rw',
                            'gfw',
                            'gfw-climate',
                            'prep',
                            'aqueduct',
                            'forest-atlas'
                        ]
                    }
                }, {
                    _id: fakeDatasetTwo.userId,
                    role: 'MANAGER',
                    provider: 'local',
                    email: 'user-two@control-tower.org',
                    extraUserData: {
                        apps: [
                            'rw',
                            'gfw',
                            'gfw-climate',
                            'prep',
                            'aqueduct',
                            'forest-atlas'
                        ]
                    }
                }, {
                    _id: fakeDatasetThree.userId,
                    role: 'MANAGER',
                    provider: 'local',
                    name: 'user three',
                    extraUserData: {
                        apps: [
                            'rw'
                        ]
                    }
                }]
            });

        const response = await requester
            .get(`/api/v1/dataset`)
            .query({
                includes: 'user',
                loggedUser: JSON.stringify(USERS.ADMIN)
            });

        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(3);
        response.body.should.have.property('links').and.be.an('object');

        const responseDatasetOne = response.body.data.find(dataset => dataset.id === fakeDatasetOne.id);
        const responseDatasetTwo = response.body.data.find(dataset => dataset.id === fakeDatasetTwo.id);
        const responseDatasetThree = response.body.data.find(dataset => dataset.id === fakeDatasetThree.id);

        responseDatasetOne.attributes.user.role.should.be.a('string').and.equal('USER');
        responseDatasetOne.attributes.user.email.should.be.a('string').and.equal('user-one@control-tower.org');
        responseDatasetOne.attributes.user.name.should.be.a('string').and.equal('test user');

        responseDatasetTwo.attributes.user.role.should.be.a('string').and.equal('MANAGER');
        responseDatasetTwo.attributes.user.email.should.be.a('string').and.equal('user-two@control-tower.org');
        responseDatasetTwo.attributes.user.should.not.have.property('name');

        responseDatasetThree.attributes.user.role.should.be.a('string').and.equal('MANAGER');
        responseDatasetThree.attributes.user.name.should.be.a('string').and.equal('user three');
        responseDatasetThree.attributes.user.should.not.have.property('email');
    });

    afterEach(async () => {
        await Dataset.remove({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
