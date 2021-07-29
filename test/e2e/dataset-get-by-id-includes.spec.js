const nock = require('nock');
const chai = require('chai');
const config = require('config');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const { createDataset, deserializeDataset, mockGetUserFromToken } = require('./utils/helpers');
const datasetGetIncludeAllAnonymous = require('./dataset-get-includes-responses/dataset-get-include-all-anonymous');

const { getTestServer } = require('./utils/test-server');
const { getUUID, expectedDataset } = require('./utils/helpers');
const widgetsFindById = require('./dataset-get-includes-responses/widget-find-by-ids');
const vocabularyFindById = require('./dataset-get-includes-responses/vocabulary-find-by-ids');
const metadataFindById = require('./dataset-get-includes-responses/metadata-find-by-ids');
const layersFindById = require('./dataset-get-includes-responses/layer-find-by-ids');
const graphFindById = require('./dataset-get-includes-responses/graph-find-by-ids');

chai.should();

let requester;

describe('Get dataset by id with includes', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    it('Get an existing dataset by ID with includes should be successful and return the dataset with the included data', async () => {
        const fakeDatasetOne = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

        nock(process.env.GATEWAY_URL)
            .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
            .reply(200, { data: [] });


        nock(process.env.GATEWAY_URL)
            .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, widgetsFindById(fakeDatasetOne));


        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, vocabularyFindById());


        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, metadataFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, layersFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, graphFindById(fakeDatasetOne));

        const response = await requester
            .get(`/api/v1/dataset/${fakeDatasetOne._id}`)
            .query({
                includes: ['layer', 'metadata', 'vocabulary', 'widget', 'graph', 'user'].join(','),
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');

        const expectedData = datasetGetIncludeAllAnonymous(fakeDatasetOne);
        response.body.data.should.deep.equal(expectedData);
    });

    it('Get an existing dataset by ID with includes and env but no filterIncludesByEnv should be successful and include related data not filtered by env', async () => {
        const fakeDatasetOne = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

        nock(process.env.GATEWAY_URL)
            .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
            .reply(200, { data: [] });


        nock(process.env.GATEWAY_URL)
            .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, widgetsFindById(fakeDatasetOne));


        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, vocabularyFindById());


        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, metadataFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, layersFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id] })
            .reply(200, graphFindById(fakeDatasetOne));

        const response = await requester
            .get(`/api/v1/dataset/${fakeDatasetOne._id}`)
            .query({
                includes: ['layer', 'metadata', 'vocabulary', 'widget', 'graph', 'user'].join(','),
                env: 'potato'
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');

        const expectedData = datasetGetIncludeAllAnonymous(fakeDatasetOne);
        response.body.data.should.deep.equal(expectedData);
    });

    it('Get an existing dataset by ID with includes, env and filterIncludesByEnv=true should be successful and include related data filtered by env', async () => {
        const fakeDatasetOne = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

        nock(process.env.GATEWAY_URL)
            .post('/auth/user/find-by-ids', { ids: [fakeDatasetOne.userId] })
            .query({
                env: 'potato'
            })
            .reply(200, { data: [] });

        nock(process.env.GATEWAY_URL)
            .post('/v1/widget/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                env: 'potato'
            })
            .reply(200, widgetsFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/vocabulary/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                env: 'potato'
            })
            .reply(200, vocabularyFindById());

        nock(process.env.GATEWAY_URL)
            .post('/v1/dataset/metadata/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                env: 'potato'
            })
            .reply(200, metadataFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/layer/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                env: 'potato'
            })
            .reply(200, layersFindById(fakeDatasetOne));

        nock(process.env.GATEWAY_URL)
            .post('/v1/graph/find-by-ids', { ids: [fakeDatasetOne.id] })
            .query({
                env: 'potato'
            })
            .reply(200, graphFindById(fakeDatasetOne));

        const response = await requester
            .get(`/api/v1/dataset/${fakeDatasetOne._id}`)
            .query({
                includes: ['layer', 'metadata', 'vocabulary', 'widget', 'graph', 'user'].join(','),
                env: 'potato',
                filterIncludesByEnv: true
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');

        const expectedData = datasetGetIncludeAllAnonymous(fakeDatasetOne);
        response.body.data.should.deep.equal(expectedData);
    });

    afterEach(async () => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }

        await Dataset.deleteMany({}).exec();
    });
});
