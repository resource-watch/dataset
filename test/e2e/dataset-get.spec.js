const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const { createDataset, deserializeDataset, mockGetUserFromToken } = require('./utils/helpers');

const { getTestServer } = require('./utils/test-server');
const { getUUID, expectedDataset } = require('./utils/helpers');

chai.should();

let requester;

describe('Get datasets tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    /* Get All Datasets */
    it('Get all datasets with no arguments should be successful', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

        const response = await requester
            .get(`/api/v1/dataset`);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array');
        response.body.should.have.property('links').and.be.an('object');

        const datasetOne = deserializeDataset(response)[0];

        datasetOne.attributes.should.have.property('dataLastUpdated').and.equal(cartoFakeDataset.dataLastUpdated.toISOString());
        datasetOne.should.deep.equal(expectedDataset(cartoFakeDataset));
    });

    it('Get datasets filtered by owner\'s role = ADMIN as an ADMIN should be successful and filter by the given role', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
        nock(process.env.CT_URL).get('/auth/user/ids/ADMIN').reply(200, { data: [USERS.ADMIN.id] });

        const response = await requester
            .get(`/api/v1/dataset`)
            .set('Authorization', `Bearer abcd`)
            .query({ 'user.role': 'ADMIN' });
        response.body.data.length.should.equal(2);
        response.body.data.map((dataset) => dataset.attributes.userId.should.equal(USERS.ADMIN.id));
    });

    it('Get datasets filtered by owner\'s role = USER as an ADMIN should be successful and filter by the given role', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
        nock(process.env.CT_URL).get('/auth/user/ids/USER').reply(200, { data: [USERS.USER.id] });

        const response = await requester
            .get(`/api/v1/dataset`)
            .set('Authorization', `Bearer abcd`)
            .query({ 'user.role': 'USER' });
        response.body.data.length.should.equal(1);
        response.body.data.map((dataset) => dataset.attributes.userId.should.equal(USERS.USER.id));
    });

    it('Get datasets filtered by owner\'s as a MANAGER should be successful but not filter by the given role', async () => {
        mockGetUserFromToken(USERS.MANAGER);

        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();

        const response = await requester
            .get(`/api/v1/dataset`)
            .set('Authorization', `Bearer abcd`)
            .query({ 'user.role': 'USER' });
        response.body.data.length.should.equal(3);
    });

    it('Get datasets filtered by owner\'s as a USER should be successful but not filter by the given role', async () => {
        mockGetUserFromToken(USERS.USER);

        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();

        const response = await requester
            .get(`/api/v1/dataset`)
            .set('Authorization', `Bearer abcd`)
            .query({ 'user.role': 'USER' });
        response.body.data.length.should.equal(3);
    });

    it('Get datasets filtered by owner\'s as an anonymous user should be successful but not filter by the given role', async () => {
        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();

        const response = await requester
            .get(`/api/v1/dataset`)
            .query({ 'user.role': 'USER' });
        response.body.data.length.should.equal(3);
    });

    it('Get an existing dataset by ID should be successful', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

        const response = await requester
            .get(`/api/v1/dataset/${cartoFakeDataset._id}`);
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        dataset.should.have.property('name').and.equal(cartoFakeDataset.name);
        response.body.data.should.deep.equal(expectedDataset(cartoFakeDataset));
    });

    it('Get an non-existing dataset by ID should fail', async () => {
        const uuid = getUUID();
        const response = await requester
            .get(`/api/v1/dataset/${uuid}`);

        response.status.should.equal(404);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Dataset with id '${uuid}' doesn't exist`);
    });

    /* Pagination */
    it('Get a page with 3 datasets using pagination', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        const jsonFakeDataset = await new Dataset(createDataset('json')).save();
        const csvFakeDataset = await new Dataset(createDataset('csv')).save();

        const response = await requester
            .get(`/api/v1/dataset?page[number]=1&page[size]=3`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(3);
        response.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasets.map((dataset) => dataset.id);

        datasetIds.should.contain(cartoFakeDataset._id);
        datasetIds.should.contain(jsonFakeDataset._id);
        datasetIds.should.contain(csvFakeDataset._id);

        const datasetThree = deserializeDataset(response)[2];

        datasetThree.attributes.should.have.property('sources').and.eql(csvFakeDataset.sources);
        response.body.data[0].should.deep.equal(expectedDataset(cartoFakeDataset));
    });

    it('Get the first page with one dataset using pagination', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
        await new Dataset(createDataset('json')).save();
        await new Dataset(createDataset('csv')).save();

        const response = await requester
            .get(`/api/v1/dataset?page[number]=1&page[size]=1`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasets.map((dataset) => dataset.id);

        datasetIds.should.contain(cartoFakeDataset._id);
    });

    it('Get the second page with one dataset using pagination', async () => {
        await new Dataset(createDataset('cartodb')).save();
        const jsonFakeDataset = await new Dataset(createDataset('json')).save();
        await new Dataset(createDataset('csv')).save();

        const response = await requester
            .get(`/api/v1/dataset?page[number]=2&page[size]=1`);
        const datasets = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);
        response.body.should.have.property('links').and.be.an('object');

        const datasetIds = datasets.map((dataset) => dataset.id);

        datasetIds.should.contain(jsonFakeDataset._id);
    });

    it('Get an existing dataset by ID should be successful - With `sources` field', async () => {
        await new Dataset(createDataset('cartodb')).save();
        await new Dataset(createDataset('json')).save();
        const csvFakeDataset = await new Dataset(createDataset('csv')).save();

        const response = await requester
            .get(`/api/v1/dataset/${csvFakeDataset._id}`);
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        dataset.should.have.property('name').and.equal(csvFakeDataset.name);
        dataset.should.have.property('sources').and.eql(csvFakeDataset.sources);
        dataset.should.have.property('connectorUrl').and.equal(csvFakeDataset.connectorUrl);
    });

    it('Getting datasets without applying subscribable filter returns 200 OK response including all datasets', async () => {
        const ds1 = await new Dataset(createDataset('cartodb')).save();
        const ds2 = await new Dataset(createDataset('cartodb', { subscribable: false })).save();
        const ds3 = await new Dataset(createDataset('cartodb', { subscribable: {} })).save();
        const ds4 = await new Dataset(createDataset('cartodb', { subscribable: { hello: 1 } })).save();

        const response = await requester
            .get(`/api/v1/dataset`);
        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(4);

        const datasets = deserializeDataset(response);
        const datasetIds = datasets.map((dataset) => dataset.id);
        datasetIds.should.contain(ds1._id);
        datasetIds.should.contain(ds2._id);
        datasetIds.should.contain(ds3._id);
        datasetIds.should.contain(ds4._id);
    });

    it('Getting datasets with the subscribable filter set to true returns 200 OK response including only subscribable datasets', async () => {
        const ds1 = await new Dataset(createDataset('cartodb')).save();
        const ds2 = await new Dataset(createDataset('cartodb', { subscribable: false })).save();
        const ds3 = await new Dataset(createDataset('cartodb', { subscribable: {} })).save();
        const ds4 = await new Dataset(createDataset('cartodb', { subscribable: { hello: 1 } })).save();

        const response = await requester
            .get(`/api/v1/dataset?subscribable=true`);
        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);

        const datasets = deserializeDataset(response);
        const datasetIds = datasets.map((dataset) => dataset.id);
        datasetIds.should.not.contain(ds1._id);
        datasetIds.should.not.contain(ds2._id);
        datasetIds.should.not.contain(ds3._id);
        datasetIds.should.contain(ds4._id);
    });

    it('Getting datasets with the subscribable filter set to false returns 200 OK response including only non-subscribable datasets', async () => {
        const ds1 = await new Dataset(createDataset('cartodb')).save();
        const ds2 = await new Dataset(createDataset('cartodb', { subscribable: false })).save();
        const ds3 = await new Dataset(createDataset('cartodb', { subscribable: {} })).save();
        const ds4 = await new Dataset(createDataset('cartodb', { subscribable: { hello: 1 } })).save();

        const response = await requester
            .get(`/api/v1/dataset?subscribable=false`);
        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(3);

        const datasets = deserializeDataset(response);
        const datasetIds = datasets.map((dataset) => dataset.id);
        datasetIds.should.contain(ds1._id);
        datasetIds.should.contain(ds2._id);
        datasetIds.should.contain(ds3._id);
        datasetIds.should.not.contain(ds4._id);
    });

    it('Getting datasets filtering by custom fields (STRINGS only) in the applicationConfig field returns 200 OK response including only datasets that match the filter', async () => {
        const ds1 = await new Dataset(createDataset('cartodb')).save();
        const ds2 = await new Dataset(createDataset('cartodb', { applicationConfig: { rw: { highlighted: 'false' } } })).save();
        const ds3 = await new Dataset(createDataset('cartodb', { applicationConfig: { rw: { highlighted: 'true' } } })).save();
        const ds4 = await new Dataset(createDataset('cartodb', { applicationConfig: { rw: { highlighted: true } } })).save();

        const response = await requester
            .get(`/api/v1/dataset?applicationConfig.rw.highlighted=true`);
        response.status.should.equal(200);
        response.body.should.have.property('data').with.lengthOf(1);

        const datasets = deserializeDataset(response);
        const datasetIds = datasets.map((dataset) => dataset.id);
        datasetIds.should.not.contain(ds1._id);
        datasetIds.should.not.contain(ds2._id);
        datasetIds.should.contain(ds3._id);
        datasetIds.should.not.contain(ds4._id);
    });

    it('Getting datasets filtering by dataset fields and by custom fields in the applicationConfig field returns 200 OK response including only datasets that match the filter', async () => {
        const ds1 = await new Dataset(createDataset('gee')).save();
        const ds2 = await new Dataset(createDataset('gee', { applicationConfig: { rw: { highlighted: 'false' } } })).save();
        const ds3 = await new Dataset(createDataset('cartodb', { applicationConfig: { rw: { highlighted: 'true' } } })).save();
        const ds4 = await new Dataset(createDataset('cartodb', { applicationConfig: { rw: { highlighted: true } } })).save();

        const response1 = await requester
            .get(`/api/v1/dataset?provider=cartodb&applicationConfig.rw.highlighted=true`);
        response1.status.should.equal(200);
        response1.body.should.have.property('data').with.lengthOf(1);

        const datasetIds1 = response1.body.data.map((dataset) => dataset.id);
        datasetIds1.should.not.contain(ds1._id);
        datasetIds1.should.not.contain(ds2._id);
        datasetIds1.should.contain(ds3._id);
        datasetIds1.should.not.contain(ds4._id);

        const response2 = await requester
            .get(`/api/v1/dataset?provider=gee&applicationConfig.rw.highlighted=false`);
        response2.status.should.equal(200);
        response2.body.should.have.property('data').with.lengthOf(1);

        const datasetIds2 = response2.body.data.map((dataset) => dataset.id);
        datasetIds2.should.not.contain(ds1._id);
        datasetIds2.should.contain(ds2._id);
        datasetIds2.should.not.contain(ds3._id);
        datasetIds2.should.not.contain(ds4._id);
    });


    it('Get an existing dataset by ID should be successful and you should be able to retrieve latestUpdated information', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

        const response = await requester
            .get(`/api/v1/dataset/${cartoFakeDataset._id}/lastUpdated`);
       // const dataset = deserializeDataset(response);

        response.status.should.equal(200);
       // response.body.should.have.property('data').and.be.an('object');
        //dataset.should.have.property('name').and.equal(cartoFakeDataset.name);
       // response.body.data.should.deep.equal(expectedDataset(cartoFakeDataset));
    });


    /**
     * We'll want to limit the maximum page size in the future
     * However, as this will cause a production BC break, we can't enforce it just now
     */
    // it('Getting datasets with page size over 100 should return 400 Bad Request', async () => {
    //     const list = await requester
    //          .get('/api/v1/dataset?page[size]=101');
    //     list.status.should.equal(400);
    //     list.body.errors[0].should.have.property('detail').and.equal('Invalid page size');
    // });

    afterEach(async () => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }

        await Dataset.deleteMany({}).exec();
    });
});
