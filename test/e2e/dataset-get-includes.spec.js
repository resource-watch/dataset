/* eslint-disable max-len */
const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { createDataset, mockGetUserFromToken } = require('./utils/helpers');
const { createMockUser } = require('./utils/mocks');

const metadataGetWithSearchForHuman = require('./dataset-get-includes-responses/metadata-get-search-human');
const widgetsFindById = require('./dataset-get-includes-responses/widget-find-by-ids');
const metadataFindById = require('./dataset-get-includes-responses/metadata-find-by-ids');
const vocabularyFindById = require('./dataset-get-includes-responses/vocabulary-find-by-ids');
const layersFindById = require('./dataset-get-includes-responses/layer-find-by-ids');
const graphFindById = require('./dataset-get-includes-responses/graph-find-by-ids');
const datasetGetIncludeAllAnonymous = require('./dataset-get-includes-responses/dataset-get-include-all-anonymous');
const datasetGetIncludeAllAdmin = require('./dataset-get-includes-responses/dataset-get-include-all-admin');
const { getTestServer } = require('./utils/test-server');
const { USERS } = require('./utils/test.constants');

chai.should();

let requester;

const mockThreeUsers = (id1, id2, id3) => {
    createMockUser([{
        _id: id1,
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
        _id: id2,
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
        _id: id3,
        role: 'MANAGER',
        provider: 'local',
        name: 'user three',
        extraUserData: {
            apps: [
                'rw'
            ]
        }
    }]);
};

describe('Get datasets with includes', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();

        await Dataset.deleteMany({}).exec();
    });

    it('Get datasets with includes should return requested data except users (anonymous request)', async () => {
        const fakeDatasetOne = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.GATEWAY_URL)
            .get('/v1/metadata')
            .query({ search: 'human' })
            .reply(200, metadataGetWithSearchForHuman(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .get('/v1/graph/query/search-by-label-synonyms')
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [fakeDatasetOne.id] });


        nock(process.env.GATEWAY_URL)
            .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [] });


        nock(process.env.GATEWAY_URL)
            .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, widgetsFindById(fakeDatasetOne));


        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, vocabularyFindById());


        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, metadataFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, layersFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, graphFindById(fakeDatasetOne));


        const response = await requester
            .get(`/api/v1/dataset`)
            .query({
                application: 'rw',
                env: 'production',
                includes: ['layer', 'metadata', 'vocabulary', 'widget', 'graph', 'user'].join(','),
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal(datasetGetIncludeAllAnonymous(fakeDatasetOne));
    });

    it('Get datasets with includes should return requested data including users (ADMIN user request)', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const fakeDatasetOne = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.GATEWAY_URL)
            .get('/v1/metadata')
            .query({ search: 'human' })
            .reply(200, metadataFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .get('/v1/graph/query/search-by-label-synonyms')
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, { data: [fakeDatasetOne.id] });

        nock(process.env.GATEWAY_URL)
            .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, {
                data: [{
                    ...USERS.ADMIN,
                    _id: fakeDatasetOne.userId
                }]
            });

        nock(process.env.GATEWAY_URL)
            .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, widgetsFindById(fakeDatasetOne));


        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, vocabularyFindById(fakeDatasetOne));


        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, metadataFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, layersFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id], app: 'rw' })
            .query({
                application: 'rw',
                language: 'en',
                page: { number: '1', size: '12' },
                published: true,
                search: 'human'
            })
            .reply(200, graphFindById(fakeDatasetOne));


        const response = await requester
            .get(`/api/v1/dataset`)
            .query({
                application: 'rw',
                env: 'production',
                includes: 'layer,metadata,vocabulary,widget,graph,user',
                language: 'en',
                page: {
                    number: 1,
                    size: 12,
                },
                published: true,
                search: 'human'
            })
            .set('Authorization', `Bearer abcd`);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        response.body.data[0].should.deep.equal(datasetGetIncludeAllAdmin(fakeDatasetOne));
    });

    it('Get datasets with includes user should return a list of datasets and user name, email and role, even if only partial data exists', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const fakeDatasetOne = await new Dataset(createDataset('cartodb')).save();
        const fakeDatasetTwo = await new Dataset(createDataset('cartodb')).save();
        const fakeDatasetThree = await new Dataset(createDataset('cartodb')).save();
        mockThreeUsers(fakeDatasetOne.userId, fakeDatasetTwo.userId, fakeDatasetThree.userId);

        const response = await requester
            .get(`/api/v1/dataset`)
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(3);
        response.body.should.have.property('links').and.be.an('object');

        const responseDatasetOne = response.body.data.find((dataset) => dataset.id === fakeDatasetOne.id);
        const responseDatasetTwo = response.body.data.find((dataset) => dataset.id === fakeDatasetTwo.id);
        const responseDatasetThree = response.body.data.find((dataset) => dataset.id === fakeDatasetThree.id);

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

    it('Getting datasets with includes user and user role USER should not add the usersRole query param to the pagination links', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const fakeDatasetOne = await new Dataset(createDataset('cartodb')).save();
        const fakeDatasetTwo = await new Dataset(createDataset('cartodb')).save();
        const fakeDatasetThree = await new Dataset(createDataset('cartodb')).save();
        mockThreeUsers(fakeDatasetOne.userId, fakeDatasetTwo.userId, fakeDatasetThree.userId);
        nock(process.env.GATEWAY_URL).get('/auth/user/ids/USER').reply(200, { data: [USERS.USER.id] });

        const response = await requester
            .get(`/api/v1/dataset`)
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                'user.role': 'USER'
            });

        response.status.should.equal(200);
        response.body.should.have.property('links').and.be.an('object');
        response.body.links.should.have.property('first').and.not.contain('usersRole=');
        response.body.links.should.have.property('last').and.not.contain('usersRole=');
        response.body.links.should.have.property('prev').and.not.contain('usersRole=');
        response.body.links.should.have.property('next').and.not.contain('usersRole=');
        response.body.links.should.have.property('self').and.not.contain('usersRole=');
    });


    describe('Environments', () => {

        it('Get datasets with includes and search, with no filterIncludesByEnv filter and no env value, should load included data without filtering it by env', async () => {
            const fakeDatasetOne = await new Dataset(createDataset('cartodb')).save();

            nock(process.env.GATEWAY_URL)
                .get('/v1/metadata')
                .query({ search: 'human' })
                .reply(200, metadataGetWithSearchForHuman(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .get('/v1/graph/query/search-by-label-synonyms')
                .query({
                    search: 'human'
                })
                .reply(200, { data: [fakeDatasetOne.id] });


            nock(process.env.GATEWAY_URL)
                .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
                .query({
                    search: 'human'
                })
                .reply(200, { data: [] });


            nock(process.env.GATEWAY_URL)
                .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, widgetsFindById(fakeDatasetOne));


            nock(process.env.GATEWAY_URL)
                .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, vocabularyFindById());


            nock(process.env.GATEWAY_URL)
                .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, metadataFindById(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, layersFindById(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, graphFindById(fakeDatasetOne));


            const response = await requester
                .get(`/api/v1/dataset`)
                .query({
                    includes: ['layer', 'metadata', 'vocabulary', 'widget', 'graph', 'user'].join(','),
                    search: 'human'
                });

            response.status.should.equal(200);
            response.body.should.have.property('data').with.lengthOf(1);
            response.body.should.have.property('links').and.be.an('object');

            response.body.data[0].should.deep.equal(datasetGetIncludeAllAnonymous(fakeDatasetOne));
        });

        it('Get datasets with includes and search, with no filterIncludesByEnv filter and custom env, should load included data without filtering it by env', async () => {
            const fakeDatasetOne = await new Dataset(createDataset('cartodb', { env: 'custom' })).save();

            nock(process.env.GATEWAY_URL)
                .get('/v1/metadata')
                .query({ search: 'human' })
                .reply(200, metadataGetWithSearchForHuman(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .get('/v1/graph/query/search-by-label-synonyms')
                .query({
                    search: 'human'
                })
                .reply(200, { data: [fakeDatasetOne.id] });


            nock(process.env.GATEWAY_URL)
                .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
                .query({
                    search: 'human'
                })
                .reply(200, { data: [] });


            nock(process.env.GATEWAY_URL)
                .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, widgetsFindById(fakeDatasetOne));


            nock(process.env.GATEWAY_URL)
                .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, vocabularyFindById());


            nock(process.env.GATEWAY_URL)
                .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, metadataFindById(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, layersFindById(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    search: 'human'
                })
                .reply(200, graphFindById(fakeDatasetOne));


            const response = await requester
                .get(`/api/v1/dataset`)
                .query({
                    env: 'custom',
                    includes: ['layer', 'metadata', 'vocabulary', 'widget', 'graph', 'user'].join(','),
                    search: 'human'
                });

            response.status.should.equal(200);
            response.body.should.have.property('data').with.lengthOf(1);
            response.body.should.have.property('links').and.be.an('object');

            const expectedData = datasetGetIncludeAllAnonymous(fakeDatasetOne);
            expectedData.attributes.env = 'custom';
            response.body.data[0].should.deep.equal(expectedData);
        });

        it('Get datasets with includes and search, with filterIncludesByEnv set to true and custom env, should load included data filtered by env', async () => {
            const fakeDatasetOne = await new Dataset(createDataset('cartodb', { env: 'custom' })).save();

            nock(process.env.GATEWAY_URL)
                .get('/v1/metadata')
                .query({ search: 'human' })
                .reply(200, metadataGetWithSearchForHuman(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .get('/v1/graph/query/search-by-label-synonyms')
                .query({
                    env: 'custom',
                    search: 'human'
                })
                .reply(200, { data: [fakeDatasetOne.id] });


            nock(process.env.GATEWAY_URL)
                .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
                .query({
                    env: 'custom',
                    search: 'human'
                })
                .reply(200, { data: [] });


            nock(process.env.GATEWAY_URL)
                .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    env: 'custom',
                    search: 'human'
                })
                .reply(200, widgetsFindById(fakeDatasetOne));


            nock(process.env.GATEWAY_URL)
                .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    env: 'custom',
                    search: 'human'
                })
                .reply(200, vocabularyFindById());


            nock(process.env.GATEWAY_URL)
                .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    env: 'custom',
                    search: 'human'
                })
                .reply(200, metadataFindById(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    env: 'custom',
                    search: 'human'
                })
                .reply(200, layersFindById(fakeDatasetOne));

            nock(process.env.GATEWAY_URL)
                .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id] })
                .query({
                    env: 'custom',
                    search: 'human'
                })
                .reply(200, graphFindById(fakeDatasetOne));


            const response = await requester
                .get(`/api/v1/dataset`)
                .query({
                    env: 'custom',
                    includes: ['layer', 'metadata', 'vocabulary', 'widget', 'graph', 'user'].join(','),
                    search: 'human',
                    filterIncludesByEnv: true
                });

            response.status.should.equal(200);
            response.body.should.have.property('data').with.lengthOf(1);
            response.body.should.have.property('links').and.be.an('object');

            const expectedData = datasetGetIncludeAllAnonymous(fakeDatasetOne);
            expectedData.attributes.env = 'custom';
            response.body.data[0].should.deep.equal(expectedData);
        });

    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
